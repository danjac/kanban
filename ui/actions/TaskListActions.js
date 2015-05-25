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

    async createTaskList(name) {
        const list = await api.newTaskList(name);
        return list;
    }

    async createTask(list, text) {
        const task = await api.newTask(list.id, text);
        return {list, task};
    }

    moveTask(list, task) {
        api.moveTask(list.id, task.id);
        return {list, task};
    }

    deleteTaskList(list) {
        api.deleteTaskList(list.id);
        return list;
    }

    deleteTask(task) {
        api.deleteTask(task.id);
        return task;
    }
}
