import Immutable from 'immutable';

import alt from '../flux';
import actions from '../actions/TaskListActions';


const TaskList = new Immutable.Record({
    id: undefined,
    name: '',
    isEditing: false,
    ordering: 0,
    tasks: new Immutable.List()
});


const Task = new Immutable.Record({
    id: undefined,
    text: '',
    taskListId: undefined
});


export default class TaskListStore {
    constructor() {

        this.bindActions(actions);
        this.taskListMap = new Immutable.OrderedMap();
        this.taskLists = new Immutable.List();
        this.isLoaded = false;

    }

    getBoard(taskLists) {
        this.taskListMap = this.taskListMap.clear();
        taskLists.forEach((result) => {

            const tasks = new Immutable.List(result.tasks.map((task) => new Task(task)));
            const taskList = new TaskList(result).set("tasks", tasks);

            this.saveList(taskList);

        }.bind(this));
        this.dispatch();
    }

    createTaskList(list) {
        this.saveList(new TaskList(list).set("tasks", new Immutable.List()));
        this.dispatch();
    }

    moveTaskList({list, targetList}) {

        if (list === undefined || targetList === undefined) {
            return;
        }
        const ordering = list.ordering,
              targetOrdering = targetList.ordering;

        this.saveList(this.getList(list.id).set("ordering", targetOrdering));
        this.saveList(this.getList(targetList.id).set("ordering", ordering));
        this.dispatch();

    }

    updateTaskListName({list, name}) {

        this.saveList(this.getList(list.id).set("name", name));
        this.dispatch();
    }

    toggleTaskListEditMode(list) {
        const rec = this.getList(list.id);
        this.saveList(rec.set("isEditing", !rec.isEditing));
        this.dispatch();
    }

    createTask({list, task}) {
        this.saveList(this.addTask(this.getList(list.id), new Task(task)));
        this.dispatch();
    }

    deleteTaskList(list) {
        this.taskListMap = this.taskListMap.delete(list.id);
        this.dispatch();
    }

    deleteTask(task) {
        this.saveList(this.removeTask(task));
        this.dispatch();
    }

    moveTask({list, task}) {

        this.saveList(this.removeTask(task));
        const newTaskRec = new Task(task).set("taskListId", list.id);
        this.saveList(this.addTask(this.getList(list.id), newTaskRec));

        this.dispatch();
    }

    saveList(newList) {
        this.taskListMap = this.taskListMap.set(newList.id, newList);
    }

    getList(id) {
        return this.taskListMap.get(id);
    }

    addTask(list, task) {
        return list.set("tasks", list.tasks.unshift(task));
    }

    removeTask(task) {
        const list = this.getList(task.taskListId);
        const tasks = list.tasks.filterNot((t) => t.id === task.id);
        return list.set("tasks", tasks);
     }

    dispatch() {
        const result = this.taskListMap.toList().sort((a, b) => {
            return (a.ordering === b.ordering) ? 0 : (a.ordering > b.ordering ? 1 : -1);
        });
        console.log("setting state", result);
        this.setState({
            taskLists: result,
            isLoaded: true
        });
    }

}

export default alt.createStore(TaskListStore);
