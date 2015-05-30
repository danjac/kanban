import React from 'react';
import sinon from 'sinon';
import expect from 'expect';
import TestUtils from 'react/lib/ReactTestUtils';
import AppFlux from '../../ui/flux';
import TaskList from '../../ui/components/TaskList';

import {makeTestContainer} from '../utils';

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

        const TaskListContext = makeTestContainer(TaskList);

        const root = TestUtils.renderIntoDocument(
                <TaskListContext flux={flux}
                                 list={list}
                                 isOver={false}
                                 connectDropTarget={connect} />);


        const component = TestUtils.findRenderedComponentWithType(root, TaskList).decoratedComponentInstance;

        sinon.stub(actions, "createTask");

        component.refs.newTask.getInputDOMNode().value = "new task!";
        TestUtils.Simulate.submit(component.refs.newTaskForm.getDOMNode());
        expect(actions.createTask.calledOnce).toBe(true);

    });

    it('toggles edit mode', function() {

        const list = {
            id: 1,
            name: "testing",
            tasks: []
        };

        const flux = new AppFlux(),
              actions = flux.getActions("taskLists");

        const connect = function(el) { return el; };

        const TaskListContext = makeTestContainer(TaskList);

        const root = TestUtils.renderIntoDocument(
                <TaskListContext flux={flux}
                                 list={list}
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

        const flux = new AppFlux();

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
                <TaskListContext flux={flux}
                                 list={list}
                                 isOver={false}
                                 connectDropTarget={connect} />
        );

    });
});


