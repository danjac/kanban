import React from 'react';
import sinon from 'sinon';
import expect from 'expect';
import TestUtils from 'react/lib/ReactTestUtils';
import AppFlux from '../../ui/flux';
import TaskList from '../../ui/components/TaskList';
import TestBackend from 'react-dnd/modules/backends/Test';
import {DragDropContext} from 'react-dnd';



function wrapContext(DecoratedComponent) {
    @DragDropContext(TestBackend)
    class TestContextContainer extends React.Component {
        render() {
            return <DecoratedComponent {...this.props} />;
        }
    }
    return TestContextContainer;
}

describe('task list', function() {
    it('handles a new task', function() {
        const flux = new AppFlux(),
              actions = flux.getActions("taskLists");

        const connect = function(el) { return el; };

        const list = {
            name: "testing",
            tasks: [
            ]
        };

        const TaskListContext = wrapContext(TaskList);

        const component = TestUtils.renderIntoDocument(
                <TaskListContext flux={flux}
                                 list={list}
                                 isOver={false}
                                 connectDropTarget={connect} />);

        console.log(component)
        sinon.stub(actions, "createTask");

        component.refs.newTask.getInputDOMNode().value = "new task!";
        TestUtils.simulate.submit(component.refs.newTaskForm.getDOMNode());
        assert(actions.createTask.calledOnce);

    });

    it('renders a list with tasks', function() {

        const flux = new AppFlux();

        const connect = function(el) { return el; };

        const list = {
            name: "testing",
            tasks: [
                {
                    text: "test1"
                }
            ]
        };

        const TaskListContext = wrapContext(TaskList);

        const component = TestUtils.renderIntoDocument(
                <TaskListContext flux={flux}
                                 list={list}
                                 isOver={false}
                                 connectDropTarget={connect} />
        );

    });
});


