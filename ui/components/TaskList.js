import _ from 'lodash';
import React from 'react';
import {Input, Panel, Glyphicon, ListGroup} from 'react-bootstrap';
import {DropTarget, DragSource} from 'react-dnd';

import {ItemTypes} from '../constants';
import Task from './Task';

const TaskListTarget = {
    drop(props) {
        return {list: props.list};
    }
};

const TaskListSource = {
    beginDrag(props) {
        return props;
    },

    endDrag(props, monitor) {
        const item = monitor.getItem(),
              dropResult = monitor.getDropResult();
        if (dropResult) {
            props.actions.moveTaskList(dropResult.list.id, item.list.id);
        }

    }
};


@DragSource(ItemTypes.TASKLIST, TaskListSource, (connect,monitor) => {
    return {
        connectDragSource: connect.dragSource(),
        isDragging: monitor.isDragging()
    };
})
@DropTarget([ItemTypes.TASKLIST, ItemTypes.TASK], TaskListTarget, (connect, monitor) => {
    return {
        connectDropTarget: connect.dropTarget(),
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop()
    };
})
export default class TaskList extends React.Component {

    static propTypes = {
        connectDropTarget: React.PropTypes.func.isRequired,
        isOver: React.PropTypes.bool.isRequired,
        canDrop: React.PropTypes.bool.isRequired,
        actions: React.PropTypes.object.isRequired
    }

    constructor(props) {
        super(props);
        this.handleNewTask = this.handleNewTask.bind(this);
        this.handleDeleteList = this.handleDeleteList.bind(this);
        this.handleUpdateName = this.handleUpdateName.bind(this);
        this.handleEditMode = this.handleEditMode.bind(this);
        ///
    }

    handleNewTask(event) {
        event.preventDefault();
        const text = this.refs.newTask.getValue().trim();
        this.refs.newTask.getInputDOMNode().value = "";
        if (text) {
            this.props.actions.createTask(this.props.list.id, text);
        }
    }

    handleDeleteList(event) {
        event.preventDefault();
        this.props.actions.deleteTaskList(this.props.list.id);
    }

    handleEditMode(event) {
        event.preventDefault();
        this.props.actions.toggleTaskListEditMode(this.props.list.id);
    }

    handleUpdateName(event) {

        event.preventDefault();
        this.props.actions.toggleTaskListEditMode(this.props.list.id);

        const name = this.refs.editName.getValue().trim();

        if (name) {
            this.props.actions.updateTaskListName(this.props.list.id, name);
        }
    }

    shouldFocusEditName() {
        if (this.props.list.isEditing && this.refs.editName) {
            React.findDOMNode(this.refs.editName.getInputDOMNode()).select();
        }
    }

    componentDidUpdate() {
        this.shouldFocusEditName();
    }

    render() {

        const {list, canDrop, isOver, connectDropTarget, connectDragSource, isDragging, actions} = this.props;
        const {id, name, tasks, isEditing, ordering} = list;

        const isActive = canDrop && isOver,
              bgColor = isActive ? '#FFFE85' : '#fff';

        let style = {backgroundColor: bgColor, minHeight: 300};

        if (isDragging) {
            style = _.assign(style, {
                opacity: 0.5,
                border: 'dashed 1pt #333'
            });
        }


        let header = (
            <h3><a onClick={this.handleDeleteList}><Glyphicon glyph="trash" /></a>&nbsp;<span onClick={this.handleEditMode}>{name}</span></h3>
        );

        if (isEditing) {
            header = (
                <form ref="editNameForm" onSubmit={this.handleUpdateName}>
                    <Input type="text"
                           ref="editName"
                           defaultValue={name} />
                </form>
            );
        }

        return connectDragSource(connectDropTarget(

            <Panel bsStyle="primary" style={style} header={header}>
                <form ref="newTaskForm"
                      onSubmit={this.handleNewTask}>
                    <Input type="text"
                           ref="newTask"
                           placeholder="Add a task" />
                </form>
                <ListGroup>
                {(tasks || []).map((task) => {
                    return <Task key={task.id}
                                 task={task}
                                 list={list}
                                 actions={actions} 
                                 />;
                })}
                </ListGroup>
            </Panel>
        ));
    }
}



