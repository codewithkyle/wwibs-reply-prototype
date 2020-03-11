import { message } from './wwibs.js';

const button = document.body.querySelector('#start-failure');

function startTheFailure(){
    message('fake-inbox', { type: 'destined-to-fail', }, null, Infinity);
    button.removeEventListener('click', startTheFailure);
}

button.addEventListener('click', startTheFailure);
