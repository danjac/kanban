import React from 'react';
import {Glyphicon, ListGroupItem} from 'react-bootstrap';
import {DragSource} from 'react-dnd';
import {ItemTypes} from '../constants';

import actions from '../actions/TaskListActions';

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

    static propTypes = {
        task: React.PropTypes.object.isRequired,
        isDragging: React.PropTypes.bool.isRequired,
        connectDragSource: React.PropTypes.func.isRequired
    }

    handleDelete(event) {
        event.preventDefault();
        actions.deleteTask(this.props.task);
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
