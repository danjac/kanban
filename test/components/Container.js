import React from 'react';
import sinon from 'sinon';
import TestUtils from 'react/lib/ReactTestUtils';
import expect from 'expect';

import AppFlux from '../../ui/flux';
import Container from '../../ui/components/Container';

describe('root', function () {

    it('renders the root container!', function () {


        const flux = new AppFlux();

        const actions = flux.getActions("taskLists");

        sinon.stub(actions, "getBoard");

        const root = TestUtils.renderIntoDocument(<Container flux={flux}/>);
        const data = {
            lists: []
        };
        expect(root).toExist();
    });

});
