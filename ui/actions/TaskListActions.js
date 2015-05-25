import {Actions} from 'flummox';

import api from '../api';

export default class TaskListActions extends Actions {

    async getBoard() {
        try {
            return await api.getBoard();
        } catch(err) {
            console.log(err);
        }
    }

    moveTask(oldName, newName, task, index) {
        this.taskRemoved(oldName, index);
        this.newTask(newName, task);
        api.moveTask(oldName, newName, index);
    }

    createTaskList(name) {
        api.newTaskList(name);
        return name;
    }

    createTask(name, task) {
        api.newTask(name, task);
        this.newTask(name, task);
    }

    newTask(name, task) {
        return {name: name, task: task};
    }

    taskRemoved(name, index) {
        return {name: name, index: index};
    }

    deleteTask(name, index) {
        this.taskRemoved(name, index);
        api.deleteTask(name, index);
    }
}
