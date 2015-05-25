import React from 'react';
import {Button} from 'react-bootstrap';
import {DragSource} from 'react-dnd';

import {ItemTypes} from '../constants';

const TaskSource = {
    beginDrag(props) {
        return props;
    },

    endDrag(props, monitor) {
        const item = monitor.getItem(),
              dropResult = monitor.getDropResult();
        if (dropResult) {
            // remove item from Task lists A and put in B
            //window.alert(`You dropped ${item.text} into ${dropResult.name}`);
            // update the task list
            const actions = item.flux.getActions("taskLists");
            actions.moveTask(dropResult.list, item.task);
        }

    }
};


@DragSource(ItemTypes.TASK, TaskSource, (connect,monitor) => {
    return {
        connectDragSource: connect.dragSource(),
        isDragging: monitor.isDragging()
    };
})
export default class Task extends React.Component {
    /*
    static propTypes = {
        text: React.PropTypes.string.isRequired,
        isDragging: React.PropTypes.bool.isRequired,
        connectDragSource: React.PropTypes.func.isRequired
    }
    */
    handleDelete(event) {
        event.preventDefault();
        const actions = this.props.flux.getActions("taskLists");
        actions.deleteTask(this.props.task);
    }

    render() {
        const isDragging = this.props.isDragging,
              connectDragSource = this.props.connectDragSource,
              text = this.props.task.text,
              style = {opacity: isDragging? 0.5 : 1},
              handleDelete = this.handleDelete.bind(this);

        return connectDragSource(
            <div style={style}>
                <Button bsStyle="danger" onClick={handleDelete}>Delete</Button>&nbsp;
                {text}
            </div>
        );
    }

}
