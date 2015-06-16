import alt from '../flux';
import api from '../api';

export default class TaskListActions {

    constructor() {
        this.generateActions(
            'toggleTaskListEditMode'
        );
    }

    async getBoard() {
        const taskLists = await api.getBoard();
        this.dispatch(taskLists);
    }

    async createTaskList(name) {
        const list = await api.newTaskList(name);
        this.dispatch(list);
    }

    async createTask(list, text) {
        const task = await api.newTask(list.id, text);
        this.dispatch({list, task});
    }

    updateTaskListName(list, name) {
        api.updateTaskListName(list.id, name);
        this.dispatch({list, name});
    }

    moveTask(list, task) {
        api.moveTask(list.id, task.id);
        this.dispatch({list, task});
    }

    moveTaskList(list, targetList) {
        if (list.id === targetList.id) {
            return;
        }
        api.moveTaskList(list.id, targetList.id);
        this.dispatch({list, targetList});
    }

    deleteTaskList(list) {
        api.deleteTaskList(list.id);
        this.dispatch(list);
    }

    deleteTask(task) {
        api.deleteTask(task.id);
        this.dispatch(task);
    }
}

export default alt.createActions(TaskListActions);
