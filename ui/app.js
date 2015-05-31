import React from 'react';

import AppFlux from './flux';
import Container from './components/Container';

const flux = new AppFlux();

/*
const socketOptions = {
    debug: true,
    devel: true,
    protocols_whitelist: ['websocket',
        'xdr-streaming',
        'xhr-streaming',
        'iframe-eventsource',
        'iframe-htmlfile',
        'xdr-polling',
        'xhr-polling',
        'iframe-xhr-polling',
        'jsonp-polling'
    ]
};
const socket = new window.SockJS('/sock', undefined, socketOptions);

socket.onmessage = (e) => {

    const msg = JSON.parse(e.data);
    const actions = flux.getActions('taskList');

    switch (msg.type) {
        case 'reload':
            actions.reload(msg.data);
            break;
        default:
            //
    }
}

*/

React.render(<Container flux={flux} />, document.body);
