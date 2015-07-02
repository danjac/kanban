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
    return task
    .save()
    .then(task => {
        const tasks = this.tasks;
        tasks.push(task._id);
        return this.update({ tasks: tasks });
    })
    .then(result => {
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

taskSchema.methods.move = function(targetList) {
    return TaskList
    .findById(this.taskList)
    .then(list => {
        const tasks = list.tasks;
        tasks.remove(this._id);
        return list.update({ tasks: tasks })
    })
    .then(() => {
        return targetList.addTask(this)
    });
};

export const TaskList = mongoose.model('TaskList', taskListSchema);
export const Task = mongoose.model('Task', taskSchema);
