import alt from '../flux';
import api from '../api';

class TaskListActions {

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
        const task = await api.newTask(list._id, text);
        this.dispatch({list, task});
    }

    updateTaskListName(list, name) {
        api.updateTaskListName(list._id, name);
        this.dispatch({list, name});
    }

    moveTask(list, task) {
        api.moveTask(list._id, task._id);
        this.dispatch({list, task});
    }

    moveTaskList(list, targetList) {
        if (list._id === targetList._id) {
            return;
        }
        api.moveTaskList(list._id, targetList._id);
        this.dispatch({list, targetList});
    }

    deleteTaskList(list) {
        api.deleteTaskList(list._id);
        this.dispatch(list);
    }

    deleteTask(task) {
        api.deleteTask(task._id);
        this.dispatch(task);
    }
}

export default alt.createActions(TaskListActions);
