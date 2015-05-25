// code here
//require("./app.css");

import React from 'react';

import AppFlux from './flux';
import Container from './components/Container';

const flux = new AppFlux();

React.render(<Container flux={flux} />, document.body);
