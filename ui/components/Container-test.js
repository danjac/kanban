import React from 'react';
import TestUtils from 'react/lib/ReactTestUtils'; //I like using the Test Utils, but you can just use the DOM API instead.
import expect from 'expect';

import AppFlux from '../flux';
import Container from './Container';


describe('root', function () {
  it('renders the root container!', function () {
    const flux = new AppFlux();
    const root = TestUtils.renderIntoDocument(<Container flux={flux}/>);
    expect(root).toExist();
  });

});
