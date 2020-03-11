import { hookup, message } from './wwibs.js';

const sender = document.body.querySelector('#sender');
const reciever = document.body.querySelector('#reciever');

function recieverInbox(data){
    reciever.value = data.num;
}
hookup('reciever', recieverInbox);

sender.addEventListener('click', () => {
    message('reciever', {
        type: 'update',
        num: getRandomInt(100)
    })
});


function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}