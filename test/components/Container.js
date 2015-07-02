import React from 'react';
import sinon from 'sinon';
import TestUtils from 'react/lib/ReactTestUtils';
import expect from 'expect';

import api from '../../client/api';
import Container from '../../client/components/Container';

describe('container should just work', function () {

    it('renders the root container!', function () {
        sinon.stub(api, "getBoard").returns({ lists: [
            {
            name: "test",
            tasks: [
                {
                    text: "testing"
                }
            ]
            }] });
        const root = TestUtils.renderIntoDocument(<Container />);

        expect(root).toExist();
        api.getBoard.restore();
    });

});
