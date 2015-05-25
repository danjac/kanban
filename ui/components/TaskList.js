import React from 'react';
import {Input, Panel, Button, Grid, Row, Col} from 'react-bootstrap';
import {DropTarget} from 'react-dnd';

import {ItemTypes} from '../constants';
import Task from './Task';

const TaskTarget = {
    drop(props) {
        return {list: props.data};
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
    }

    handleNewTask(event) {
        event.preventDefault();
        const text = this.refs.newTask.getValue().trim();
        this.refs.newTask.getInputDOMNode().value = "";
        if (text) {
            this.actions.createTask(this.props.data, text);
        }
    }

    handleDeleteList(event) {
        event.preventDefault();
        this.actions.deleteTaskList(this.props.data);
    }

    render() {

        const {data, canDrop, isOver, connectDropTarget, flux} = this.props;
        const {id, name, tasks} = data;

        const isActive = canDrop && isOver,
              bgColor = isActive ? '#888' : '#fff',
              style = {backgroundColor: bgColor};

        const header = (
                <Row>
                    <Col xs={6}>
                        <h3>{name}</h3>
                    </Col>
                    <Col offset={3} xs={3}>
                        <Button onClick={this.handleDeleteList}>Delete</Button>
                    </Col>
                </Row>
        );

        return connectDropTarget(

            <Panel style={style} header={header}>
                <form onSubmit={this.handleNewTask}>
                    <Input type="text"
                           ref="newTask"
                           placeholder="Add a task" />
                </form>
                {tasks.map((task) => {
                    return <Task key={task.id}
                                 task={task}
                                 flux={flux} />;
                })}
            </Panel>
        );
    }
}



