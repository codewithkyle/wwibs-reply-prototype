class BroadcastHelper {
    constructor() {
        this.queueTimeout = 1000; // Milliseconds
        self.onmessage = this.handleMessage.bind(this);
        this.queuedMessages = [];
        this.queueTimer = null;
        this.inboxes = [];
        this.db = null;
        this.fallbackReplies = [];
        this.dbUid = this.uid();
        const request = indexedDB.open(`${this.dbUid}`, 1);
        request.onsuccess = (e) => {
            // @ts-ignore
            self.postMessage({
                recipient: "broadcaster",
                data: {
                    type: "worker-ready",
                },
            });
        };
        request.onupgradeneeded = (e) => {
            const response = e.target;
            this.db = response.result;
            const historyStore = this.db.createObjectStore("history", { autoIncrement: true });
            historyStore.createIndex("Unique Message ID", "messageUid", { unique: true });
            historyStore.createIndex("Recipient", "recipient", { unique: false });
            historyStore.createIndex("Sender ID", "senderID", { unique: false });
            historyStore.createIndex("Attempt", "attempt", { unique: false });
            historyStore.createIndex("Message Data", "data", { unique: false });
            const replyStore = this.db.createObjectStore("reply", { autoIncrement: true });
            replyStore.createIndex("Unique Reply ID", "replyID", { unique: true });
            replyStore.createIndex("Recipient", "recipient", { unique: false });
            replyStore.createIndex("Sender ID", "senderID", { unique: false });
        };
    }
    /**
     * The personal inbox of the `broadcast-worker` inbox.
     * @param data - the incoming `BroadcastWorkerMessage` data object
     */
    inbox(data) {
        switch (data.type) {
            case "hookup":
                this.addInbox(data);
                break;
            case "disconnect":
                this.removeInbox(data);
                break;
            case "update-addresses":
                this.updateAddressIndexes(data);
                break;
            case "init":
                this.handleUserDeviceInfo(data);
                break;
            default:
                console.error(`Unknown broadcast-worker message type: ${data.type}`);
                break;
        }
    }
    /**
     * Worker received a message from another thread.
     * This method is an alias of `self.onmessage`
     * */
    handleMessage(e) {
        const { recipient, data } = e.data;
        switch (recipient) {
            case "broadcast-worker":
                this.inbox(data);
                break;
            case "broadcaster":
                // @ts-ignore
                self.postMessage(e.data);
                break;
            default:
                this.lookup(e.data);
                break;
        }
    }
    /**
     * Quick and dirty unique ID generation.
     * This method does not follow RFC 4122 and does not guarantee a universally unique ID.
     * @see https://tools.ietf.org/html/rfc4122
     */
    uid() {
        return new Array(4)
            .fill(0)
            .map(() => Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString(16))
            .join("-");
    }
    /**
     * Add the inbox to the inboxes array.
     * @param data - an `InboxHookupMessage` object
     */
    addInbox(data) {
        const { name, inboxAddress } = data;
        const inboxData = {
            name: name.trim().toLowerCase(),
            address: inboxAddress,
            uid: this.generateUUID(),
        };
        this.inboxes.push(inboxData);
    }
    removeInbox(data) {
        const { inboxAddress } = data;
        for (let i = 0; i < this.inboxes.length; i++) {
            if (this.inboxes[i].address === inboxAddress) {
                this.inboxes.splice(i, 1);
                break;
            }
        }
    }
    updateAddressIndexes(data) {
        const { addresses } = data;
        for (let i = 0; i < addresses.length; i++) {
            for (let k = 0; k < this.inboxes.length; k++) {
                if (addresses[i].oldAddressIndex === this.inboxes[i].address) {
                    this.inboxes[i].address = addresses[i].newAddressIndex;
                    break;
                }
            }
        }
        // @ts-ignore
        self.postMessage({
            recipient: "broadcaster",
            data: {
                type: "cleanup-complete",
            },
        });
    }
    /**
     * Creates a transaction with indexedDB to store the message within the History table.
     */
    async makeHistory(recipient, data, messageId, senderID, attempt = null) {
        new Promise((resolve, reject) => {
            const transaction = this.db.transaction("history", "readwrite");
            const store = transaction.objectStore("history");
            const transactionData = {
                senderID: senderID,
                messageUid: messageId,
                recipient: recipient,
                data: data,
                attempt: attempt,
            };
            store.add(transactionData);
            transaction.oncomplete = resolve;
            transaction.onerror = reject;
        })
            .then(() => { })
            .catch(error => {
            console.error(`Failed to write to the History table:`, error);
        });
    }
    /**
     * Creates a transaction with indexedDB to store the message within the History table.
     */
    async logReply(replyID, recipient, senderID) {
        new Promise((resolve, reject) => {
            const transaction = this.db.transaction("reply", "readwrite");
            const store = transaction.objectStore("reply");
            const transactionData = {
                replyID: replyID,
                recipient: recipient,
                senderID: senderID,
            };
            store.add(transactionData);
            transaction.oncomplete = resolve;
            transaction.onerror = reject;
        })
            .then(() => { })
            .catch(error => {
            console.error(`Failed to write to the Reply table:`, error);
        });
    }
    /**
     * Look up the recipient(s) within the IDBDatabase.
     * If inbox addresses are found send the array of inbox indexes to the broadcasters inbox.
     * If no recipient(s) are found check the message max attempts.
     * @param message - the `BroadcastWorkerMessage` object
     */
    async lookup(message) {
        const { data, maxAttempts, messageId, senderID } = message;
        const recipient = message.recipient.trim().toLowerCase();
        /** Record every message in the History table */
        this.makeHistory(recipient, data, messageId, senderID, message === null || message === void 0 ? void 0 : message.attempts);
        try {
            const inboxAddressIndexes = [];
            for (let i = 0; i < this.inboxes.length; i++) {
                const inbox = this.inboxes[i];
                if (inbox.name === recipient) {
                    inboxAddressIndexes.push(inbox.address);
                }
            }
            if (inboxAddressIndexes.length) {
                const replyID = this.uid();
                const response = {
                    type: "lookup",
                    data: { ...data, replyID: replyID },
                    inboxIndexes: inboxAddressIndexes,
                };
                this.logReply(replyID, recipient, senderID);
                // @ts-ignore
                self.postMessage(response);
            }
            else if (maxAttempts > 1 && message.messageId !== null) {
                if ((message === null || message === void 0 ? void 0 : message.attempts) < message.maxAttempts) {
                    message.attempts += 1;
                }
                else if ((message === null || message === void 0 ? void 0 : message.attempts) === message.maxAttempts) {
                    this.dropMessageFromQueue(message.messageId);
                }
                else {
                    message.attempts = 1;
                    this.queuedMessages.push(message);
                    if (this.queueTimer === null) {
                        this.queueTimer = setTimeout(this.flushMessageQueue.bind(this), this.queueTimeout);
                    }
                }
            }
        }
        catch (error) {
            console.error(error);
        }
    }
    /**
     * Attempts to `lookup()` any `TCP` messages that previously failed.
     */
    flushMessageQueue() {
        for (let i = 0; i < this.queuedMessages.length; i++) {
            this.lookup(this.queuedMessages[i]);
        }
        if (this.queuedMessages.length) {
            this.queueTimer = setTimeout(this.flushMessageQueue.bind(this), this.queueTimeout);
        }
        else {
            this.queueTimer = null;
        }
    }
    /**
     * Drops a queued message when the message has reached it's maximum number of attempts.
     * @param messageId - the `uid` of the message that needs to be dropped.
     */
    dropMessageFromQueue(messageId) {
        for (let i = 0; i < this.queuedMessages.length; i++) {
            if (this.queuedMessages[i].messageId === messageId) {
                this.queuedMessages.splice(i, 1);
                break;
            }
        }
    }
    handleUserDeviceInfo(data) {
        const { memory, isSafari } = data;
        if (memory <= 4) {
            /** Tells broadcaster to cleanup disconnected inboxes every minute on low-end devices */
            setInterval(() => {
                // @ts-ignore
                self.postMessage({
                    recipient: "broadcaster",
                    data: {
                        type: "cleanup",
                    },
                });
            }, 60000);
        }
        else {
            /** Tells broadcaster to cleanup disconnected inboxes every 5 minutes */
            setInterval(() => {
                // @ts-ignore
                self.postMessage({
                    recipient: "broadcaster",
                    data: {
                        type: "cleanup",
                    },
                });
            }, 300000);
        }
        if (isSafari) {
            /** Pings broadcaster every 3 seconds on Safari due to iOS auto-terminating active workers */
            setInterval(() => {
                // @ts-ignore
                self.postMessage({
                    recipient: "broadcaster",
                    data: {
                        type: "ping",
                    },
                });
            }, 3000);
        }
    }
    /**
     * Quick and dirty unique ID generation.
     * This method does not follow RFC 4122 and does not guarantee a universally unique ID.
     * @see https://tools.ietf.org/html/rfc4122
     */
    generateUUID() {
        return new Array(4)
            .fill(0)
            .map(() => Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString(16))
            .join("-");
    }
}
new BroadcastHelper();
