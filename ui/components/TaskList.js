import React from 'react';
import {Input, Panel, Glyphicon, ListGroup} from 'react-bootstrap';
import {DropTarget} from 'react-dnd';

import {ItemTypes} from '../constants';
import Task from './Task';

const TaskTarget = {
    drop(props) {
        return {list: props.list};
    }
};


@DropTarget(ItemTypes.TASK, TaskTarget, (connect, monitor) => {
    return {
        connectDropTarget: connect.dropTarget(),
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop()
    };
})
export default class TaskList extends React.Component {

    /*
    static propTypes = {
        connectDropTarget: React.PropTypes.func.isRequired,
        isOver: React.PropTypes.bool.isRequired,
        canDrop: React.PropTypes.bool.isRequired
    }
    */

    constructor(props) {
        super(props);
        this.actions = props.flux.getActions("taskLists");
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
            this.actions.createTask(this.props.list, text);
        }
    }

    handleDeleteList(event) {
        event.preventDefault();
        this.actions.deleteTaskList(this.props.list);
    }

    handleEditMode(event) {
        event.preventDefault();
        this.actions.toggleTaskListEditMode(this.props.list);
    }

    handleUpdateName(event) {

        event.preventDefault();
        this.actions.toggleTaskListEditMode(this.props.list);

        const name = this.refs.editName.getValue().trim();

        if (name) {
            this.actions.updateTaskListName(this.props.list, name);
        }
    }

    render() {

        const {list, canDrop, isOver, connectDropTarget, flux} = this.props;
        const {id, name, tasks, isEditing} = list;

        const isActive = canDrop && isOver,
              bgColor = isActive ? '#FFFE85' : '#fff',
              style = {backgroundColor: bgColor};

        let header = (
            <h3><a onClick={this.handleDeleteList}><Glyphicon glyph="trash" /></a>&nbsp;<span onClick={this.handleEditMode}>{name}</span></h3>
        );

        if (isEditing) {
            header = (
                <form ref="editNameForm" onSubmit={this.handleUpdateName}>
                    <Input type="text" ref="editName" defaultValue={name} />
                </form>
            );
        }

        return connectDropTarget(

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
                                 flux={flux} />;
                })}
                </ListGroup>
            </Panel>
        );
    }
}



