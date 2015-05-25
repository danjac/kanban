import React from 'react';
import {Input, Panel} from 'react-bootstrap';
import {DropTarget} from 'react-dnd';

import {ItemTypes} from '../constants';
import Task from './Task';

const TaskTarget = {
    drop(props) {
        return {name: props.data.name};
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
    }

    handleNewTask(event) {
        event.preventDefault();
        const text = this.refs.newTask.getValue().trim();
        this.refs.newTask.getInputDOMNode().value = "";
        if (text) {
            this.actions.createTask(this.props.data.name, text);
        }
    }

    render() {

        const {data, canDrop, isOver, connectDropTarget, flux} = this.props;
        const {name, tasks} = data;

        const isActive = canDrop && isOver,
              bgColor = isActive ? '#888' : '#fff',
              style = {backgroundColor: bgColor};

        return connectDropTarget(
            <Panel style={style} header={name}>
                <form onSubmit={this.handleNewTask}>
                    <Input type="text"
                           ref="newTask"
                           placeholder="Add a task" />
                </form>
                {tasks.map((item, num) => {
                    return <Task key={num}
                                 index={num}
                                 text={item}
                                 name={name}
                                 flux={flux} />;
                })}
            </Panel>
        );
    }
}



