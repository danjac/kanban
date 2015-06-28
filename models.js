import mongoose from 'mongoose';
import {Schema} from 'mongoose';

function maxOrdering() {
    TaskList
    .findOne()
    .sort('-ordering')
    .exec()
    .then((result) => {
        if (result) {
            return result.ordering;
        }
        return 0;
    });
}

const taskListSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    ordering: {
        type: Number,
        default: maxOrdering
    },
    tasks:  [{ type: Schema.ObjectId, ref: 'Task' }]
});

const taskSchema = new Schema({
    name: String,
    taskList: {
        type: Schema.ObjectId,
        ref: 'TaskList'
    }
});

export const TaskList = mongoose.model('TaskList', taskListSchema);
export const Task = mongoose.model('Task', taskSchema);