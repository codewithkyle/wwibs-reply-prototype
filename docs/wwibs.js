import Broadcaster from "./lib/broadcaster.js";
let script = document.head.querySelector("script#broadcaster") || null;
if (!script) {
    script = document.createElement("script");
    script.id = "broadcaster";
    script.innerHTML =
        "window.globalManager = null;window.globalMessage = null;window.globalHookup = null;window.globalDisconnect = null;window.globalReply = null;window.globalReplyAll = null;";
    document.head.appendChild(script);
    // @ts-ignore
    globalManager = new Broadcaster();
}
// @ts-ignore
globalMessage = globalManager.message.bind(globalManager);
/**
 * Sends a message to an inbox.
 * @param recipient - the name of the inboxes you want to send a message to
 * @param data - the `MessageData` object that will be sent to the inboxes
 * @param maxAttempts - the maximum number of attempts before the message is dropped, can be set to `Infinity`
 */
// @ts-ignore
export const message = globalMessage;
// @ts-ignore
globalHookup = globalManager.hookup.bind(globalManager);
/**
 * Register and hookup an inbox.
 * @param name - the name of the inbox
 * @param inbox - the function that will handle the inboxes incoming messages
 * @returns inbox UID
 */
// @ts-ignore
export const hookup = globalHookup;
// @ts-ignore
globalDisconnect = globalManager.disconnect.bind(globalManager);
/**
 * Disconnect an inbox.
 * @param inboxId - the UID of the inbox
 */
// @ts-ignore
export const disconnect = globalDisconnect;
// @ts-ignore
globalReply = globalManager.reply.bind(globalManager);
/**
 * Send a reply message.
 * @param replyID - the `replyID` value attached to the recieved `MessageData` object
 * @param data - the `MessageData` object that will be sent to the sender
 * @param maxAttempts - the maximum number of attempts before the message is dropped, can be set to `Infinity`
 */
// @ts-ignore
export const reply = globalReply;
// @ts-ignore
globalReplyAll = globalManager.replyAll.bind(globalManager);
/**
 * Send a reply to the sender and all original recipients.
 * @param replyID - the `replyID` value attached to the recieved `MessageData` object
 * @param data - the `MessageData` object that will be sent to the sender
 * @param maxAttempts - the maximum number of attempts before the message is dropped, can be set to `Infinity`
 */
// @ts-ignore
export const replyAll = globalReplyAll;
