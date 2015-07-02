import React from 'react';
import sinon from 'sinon';
import expect from 'expect';
import TestUtils from 'react/lib/ReactTestUtils';
import actions from '../../client/actions/TaskListActions';
import TaskList from '../../client/components/TaskList';

import {makeTestContainer} from '../utils';

describe('task list', function() {
    it('handles a new task', function() {

        const connect = function(el) { return el; };

        const list = {
            name: "testing",
            tasks: [
            ]
        };

        const TaskListContext = makeTestContainer(TaskList);

        const root = TestUtils.renderIntoDocument(
                <TaskListContext list={list}
                                 isOver={false}
                                 connectDropTarget={connect} />);


        const component = TestUtils.findRenderedComponentWithType(root, TaskList).decoratedComponentInstance;
        const refs = component.decoratedComponentInstance.refs;

        sinon.stub(actions, "createTask");

        refs.newTask.getInputDOMNode().value = "new task!";
        TestUtils.Simulate.submit(refs.newTaskForm.getDOMNode());
        expect(actions.createTask.calledOnce).toBe(true);

    });

    it('toggles edit mode', function() {

        const list = {
            id: 1,
            name: "testing",
            tasks: []
        };

        const connect = function(el) { return el; };

        const TaskListContext = makeTestContainer(TaskList);

        const root = TestUtils.renderIntoDocument(
                <TaskListContext list={list}
                                 isOver={false}
                                 connectDropTarget={connect} />);

        const component = TestUtils.findRenderedComponentWithType(root, TaskList).decoratedComponentInstance;
        const h3 = TestUtils.findRenderedDOMComponentWithTag(component, "h3");
        const span = TestUtils.scryRenderedDOMComponentsWithTag(h3, "span")[1];

        sinon.stub(actions, "toggleTaskListEditMode");
        TestUtils.Simulate.click(span.getDOMNode());
        expect(actions.toggleTaskListEditMode.calledOnce).toBe(true);

    });

    it('renders a list with tasks', function() {

        const connect = function(el) { return el; };

        const list = {
            id: 1,
            name: "testing",
            tasks: [
                {
                    text: "test1",
                    id: 1,
                    taskListId: 1
                }
            ]
        };

        const TaskListContext = makeTestContainer(TaskList);

        const component = TestUtils.renderIntoDocument(
                <TaskListContext list={list}
                                 isOver={false}
                                 connectDropTarget={connect} />
        );

    });
});


