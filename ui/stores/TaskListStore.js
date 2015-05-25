import _ from 'lodash';
import {Store} from 'flummox';

export default class TaskListStore extends Store {
    constructor(flux) {
        super();

        const actions = flux.getActions('taskLists');

        this.register(actions.getBoard, this.handleNewBoard);
        this.register(actions.createTaskList, this.handleNewTaskList);
        this.register(actions.newTask, this.handleNewTask);
        this.register(actions.taskRemoved, this.handleTaskRemoved);

        this.taskListMap = {};

        this.state = {
            taskLists: []
        };

    }

    handleNewBoard(taskLists) {
        this.taskListMap = {};
        _.map(taskLists, (result) => {
            this.taskListMap[result.name] = result;
        }.bind(this));
        this.dispatchTaskLists();
    }

    handleNewTaskList(name) {
        this.taskListMap[name] = {
            name: name,
            tasks: []
        };
        this.dispatchTaskLists();
    }

    handleNewTask(obj) {
        const {name, task} = obj;
        const list = this.taskListMap[name] || [];
        list.tasks.push(task);
        this.dispatchTaskLists();
    }

    handleTaskRemoved(obj) {
        const {name, index} = obj;
        const list = this.taskListMap[name] || [];
        list.tasks.splice(index, 1);
        this.dispatchTaskLists();
    }

    dispatchTaskLists() {
        this.setState({ taskLists:  _.values(this.taskListMap) });
    }

}
