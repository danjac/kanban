import React from 'react';
import sinon from 'sinon';
import TestUtils from 'react/lib/ReactTestUtils';
import expect from 'expect';

import api from '../../ui/api';
import Container from '../../ui/components/Container';

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
