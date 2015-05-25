import _ from 'lodash';
import {Store} from 'flummox';

export default class TaskListStore extends Store {
    constructor(flux) {
        super();

        const actions = flux.getActions('taskLists');

        this.register(actions.getBoard, this.handleNewBoard);
        this.register(actions.createTaskList, this.handleNewTaskList);
        this.register(actions.createTask, this.handleNewTask);
        this.register(actions.moveTask, this.handleTaskMoved);
        this.register(actions.deleteTask, this.handleTaskRemoved);
        this.register(actions.deleteTaskList, this.handleTaskListRemoved);

        this.taskListMap = {};

        this.state = {
            taskLists: []
        };

    }

    handleNewBoard(taskLists) {
        console.log(taskLists);
        this.taskListMap = {};
        taskLists.forEach((result) => {
            console.log("RESULT", result);
            this.taskListMap[result.id] = result;
        }.bind(this));
        this.dispatch();
    }

    handleNewTaskList(list) {
        this.taskListMap[list.id] = {
            name: list.name,
            tasks: []
        };
        this.dispatch();
    }

    handleNewTask(payload) {
        const {list, task} = payload;
        list.tasks.push(task);
        this.dispatch();
    }

    handleTaskListRemoved(list) {
        delete this.taskListMap[list.id];
        this.dispatch();
    }

    handleTaskRemoved(task) {
        const lists = _.values(this.taskListMap);
        lists.map((list) => {
            _.remove(list.tasks, (t) => t.id === task.id);
        });
        this.dispatch();
    }

    handleTaskMoved(payload) {
        const {list, task} = payload;
        const lists = _.values(this.taskListMap);
        lists.map((target) => {
            if (target.id === list.id) {
                target.tasks.push(task);
            } else {
                _.remove(target.tasks, (t) => t.id === task.id);
            }
        });
        this.dispatch();
    }

    dispatch() {
        this.setState({ taskLists:  _.values(this.taskListMap) });
    }

}
