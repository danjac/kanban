import React from 'react';
import { Glyphicon, ListGroupItem } from 'react-bootstrap';
import { DragSource } from 'react-dnd';
import { DnDTypes } from '../constants';

import { moveTask, deleteTask } from '../actions';

const TaskSource = {
    beginDrag(props) {
        return props;
    },

    endDrag(props, monitor) {
        const item = monitor.getItem(),
              dropResult = monitor.getDropResult();

        if (dropResult) {
            props.actions.moveTask(item.card.id, dropResult.card.id, item.task.id);
        }

    }
};


@DragSource(DnDTypes.TASK, TaskSource, (connect,monitor) => {
    return {
        connectDragSource: connect.dragSource(),
        isDragging: monitor.isDragging()
    };
})
export default class Task extends React.Component {

    static propTypes = {
        task: React.PropTypes.object.isRequired,
        card: React.PropTypes.object.isRequired,
        actions: React.PropTypes.object.isRequired,
        isDragging: React.PropTypes.bool.isRequired,
        connectDragSource: React.PropTypes.func.isRequired
    }

    handleDelete(event) {
        event.preventDefault();
        this.props.actions.deleteTask(this.props.task.id);
    }

    render() {
        const isDragging = this.props.isDragging,
              connectDragSource = this.props.connectDragSource,
              text = this.props.task.text,
              style = {opacity: isDragging? 0.5 : 1},
              handleDelete = this.handleDelete.bind(this);

        return connectDragSource(
            <ListGroupItem style={style}>
                <a onClick={handleDelete}><Glyphicon glyph="trash" /></a>&nbsp;
                {text}
            </ListGroupItem>
        );
    }

}
