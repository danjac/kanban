import mongoose from 'mongoose';
import {Schema} from 'mongoose';

const taskListSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    ordering: {
        type: Number
    },
    tasks:  [{ type: Schema.ObjectId, ref: 'Task' }]
});

taskListSchema.pre('save', function(next) {
    TaskList
    .findOne()
    .sort('-ordering')
    .exec()
    .then((result) => {
        this.ordering = result ? result.ordering + 1 : 0;
        next();
    });
});

taskListSchema.methods.addTask = function(task) {
    task.taskList = this._id;
    return task.save()
    .then((task) => {
        const tasks = this.tasks;
        tasks.push(task._id);
        return Promise.all([
            this.update({ tasks: tasks }),
            task
        ])
    })
    .then(result => {
        const [, task] = result;
        return task;
    });
};

const taskSchema = new Schema({
    text: String,
    taskList: {
        type: Schema.ObjectId,
        ref: 'TaskList'
    }
});

export const TaskList = mongoose.model('TaskList', taskListSchema);
export const Task = mongoose.model('Task', taskSchema);
