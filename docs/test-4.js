import { hookup, message, replyAll } from './wwibs.js';

function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

class ReplyAllComponentOne extends HTMLElement{
    constructor(){
        super();
        this.inboxID;
        this.inboxID2;
    }
    inbox(data){
        switch(data.type){
            case 'change-color':
                this.style.backgroundColor = getRandomColor();
                break;
            default:
                console.warn(`Unknown type: ${data.type}`);
                break;
        }
    }
    connectedCallback(){
        this.inboxID = hookup('reply-all', this.inbox.bind(this));
        this.inboxID2 = hookup('unique-reply-all', this.inbox.bind(this));
        setTimeout(()=>{
            message('reply-all', {
                type: 'change-color'
            }, this.inboxID);
        }, 3000);
    }
}
customElements.define('reply-all-component-one', ReplyAllComponentOne);

class ReplyAllComponentTwo extends HTMLElement{
    constructor(){
        super();
        this.inboxID;
        this.replied = false;
    }
    inbox(data){
        if (!this.replied){
            this.replied = true;
            setTimeout(() => {
                replyAll(data.replyID, {
                    type: 'change-color'
                }, this.inboxID)
            }, 1500);
        }
        this.style.backgroundColor = getRandomColor();
    }
    connectedCallback(){
        this.inboxID = hookup('reply-all', this.inbox.bind(this));
    }
}
customElements.define('reply-all-component-two', ReplyAllComponentTwo);

class ReplyAllComponentThree extends HTMLElement{
    constructor(){
        super();
        this.inboxID;
    }
    inbox(data){
        this.style.backgroundColor = getRandomColor();
    }
    connectedCallback(){
        this.inboxID = hookup('reply-all', this.inbox.bind(this));
    }
}
customElements.define('reply-all-component-three', ReplyAllComponentThree);