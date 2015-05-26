import React from 'react';
import TestUtils from 'react/lib/ReactTestUtils'; //I like using the Test Utils, but you can just use the DOM API instead.
import expect from 'expect';

import Container from '../../ui/components/Container';

describe('root', function () {
  it('renders the root container!', function () {
    const root = TestUtils.renderIntoDocument(<Container />);
    expect(root).toExist();
  });

});
