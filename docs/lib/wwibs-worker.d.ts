declare type InboxData = {
    name: string;
    address: number;
    uid: string;
};
interface IDBEventTarget extends EventTarget {
    result: any;
}
interface IDBEvent extends Event {
    target: IDBEventTarget;
}
declare type Reply = {
    uid: string;
    senderID: number;
    recipientIDs: Array<number>;
};
declare class BroadcastHelper {
    private queuedMessages;
    private queueTimer;
    private queueTimeout;
    private inboxes;
    private db;
    private fallbackReplies;
    private dbUid;
    constructor();
    /**
     * The personal inbox of the `broadcast-worker` inbox.
     * @param data - the incoming `BroadcastWorkerMessage` data object
     */
    private inbox;
    /**
     * Worker received a message from another thread.
     * This method is an alias of `self.onmessage`
     * */
    private handleMessage;
    /**
     * Quick and dirty unique ID generation.
     * This method does not follow RFC 4122 and does not guarantee a universally unique ID.
     * @see https://tools.ietf.org/html/rfc4122
     */
    private uid;
    /**
     * Add the inbox to the inboxes array.
     * @param data - an `InboxHookupMessage` object
     */
    private addInbox;
    private removeInbox;
    private updateAddressIndexes;
    /**
     * Creates a transaction with indexedDB to store the message within the History table.
     */
    private makeHistory;
    /**
     * Creates a transaction with indexedDB to store the message within the History table.
     */
    private logReply;
    /**
     * Look up the recipient(s) within the IDBDatabase.
     * If inbox addresses are found send the array of inbox indexes to the broadcasters inbox.
     * If no recipient(s) are found check the message max attempts.
     * @param message - the `BroadcastWorkerMessage` object
     */
    private lookup;
    /**
     * Attempts to `lookup()` any `TCP` messages that previously failed.
     */
    private flushMessageQueue;
    /**
     * Drops a queued message when the message has reached it's maximum number of attempts.
     * @param messageId - the `uid` of the message that needs to be dropped.
     */
    private dropMessageFromQueue;
    private handleUserDeviceInfo;
    /**
     * Quick and dirty unique ID generation.
     * This method does not follow RFC 4122 and does not guarantee a universally unique ID.
     * @see https://tools.ietf.org/html/rfc4122
     */
    private generateUUID;
}
