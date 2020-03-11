import { hookup, message, reply } from './wwibs.js';

function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

class ReplyComponentOne extends HTMLElement{
    constructor(){
        super();
        this.inboxID;
    }
    inbox(data){
        this.style.backgroundColor = getRandomColor();
        setTimeout(()=>{
            reply(data.replyID, {
                type: 'change-color',
            }, this.inboxID);
        }, 2000);
    }
    connectedCallback(){
        this.inboxID = hookup('reply-one', this.inbox.bind(this));
    }
}

class ReplyComponentTwo extends HTMLElement{
    constructor(){
        super();
        this.inboxID;
    }
    inbox(data){
        this.style.backgroundColor = getRandomColor();
        setTimeout(()=>{
            reply(data.replyID, {
                type: 'change-color',
            }, this.inboxID);
        }, 2000);
    }
    connectedCallback(){
        this.inboxID = hookup('reply-two', this.inbox.bind(this));
        message('reply-one', {
            data: 'change-color'
        }, this.inboxID, Infinity);
    }
}

customElements.define('reply-component-one', ReplyComponentOne);
customElements.define('reply-component-two', ReplyComponentTwo);