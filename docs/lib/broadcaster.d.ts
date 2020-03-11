export default class Broadcaster {
    private worker;
    private historyWorker;
    private inboxes;
    private messageQueue;
    private state;
    constructor();
    private setupBroadcastWorker;
    /**
     * Set the broadcasters `workerReady` state to `true` and flush any queued messages.
     */
    private flushMessageQueue;
    private sendDataToInboxes;
    /**
     * Broadcaster received a message from the Inbox worker.
     * This method is an alias of `this.worker.onmessage`
     */
    private handleWorkerMessage;
    private sendUserDeviceInformation;
    /**
     * The broadcaster's personal inbox.
     */
    private inbox;
    /**
     * Sends a message to an inbox.
     * @param recipient - the name of the inboxes you want to send a message to
     * @param senderID - the unique inbox ID provided by the `hookup()` method
     * @param data - the `MessageData` object that will be sent to the inboxes
     * @param maxAttempts - the maximum number of attempts before the message is dropped, can be set to `Infinity`
     */
    message(recipient: string, data: MessageData, senderID?: any, maxAttempts?: number): void;
    /**
     * Register and hookup an inbox.
     * @param name - the name of the inbox
     * @param inbox - the function that will handle the inboxes incoming messages
     * @returns inbox UID
     */
    hookup(name: string, inbox: Function): string;
    /**
     * Sends a message to the worker using `postMessage()` or queues the message if the worker isn't ready.
     * @param message - the `BroadcastWorkerMessage` object that will be sent
     */
    private postMessageToWorker;
    private cleanup;
    /**
     * Disconnect an inbox.
     * @param inboxId - the UID of the inbox
     */
    disconnect(inboxId: string): void;
    private disconnectInbox;
}
