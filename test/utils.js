import React from 'react';
import TestBackend from 'react-dnd/modules/backends/Test';
import {DragDropContext} from 'react-dnd';


export function makeTestContainer(DecoratedComponent) {
    @DragDropContext(TestBackend)
    class TestContextContainer extends React.Component {
        render() {
            return <DecoratedComponent {...this.props} />;
        }
    }
    return TestContextContainer;
}

