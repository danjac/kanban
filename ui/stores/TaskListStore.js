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

        this.bindListeners({
            onNewBoard: actions.getBoard,
            onNewTaskList: actions.createTaskList,
            onNewTask: actions.createTask,
            onTaskListMoved: actions.moveTaskList,
            onTaskMoved: actions.moveTask,
            onTaskRemoved: actions.deleteTask,
            onTaskListRemoved: actions.deleteTaskList,
            onUpdateTaskListName: actions.updateTaskListName,
            onToggleTaskListEditMode: actions.toggleTaskListEditMode
        });

        this.taskListMap = new Immutable.OrderedMap();
        this.taskLists = new Immutable.List();
        this.isLoaded = false;

    }

    onNewBoard(taskLists) {
        this.taskListMap = this.taskListMap.clear();
        taskLists.forEach((result) => {

            const tasks = new Immutable.List(result.tasks.map((task) => new Task(task)));
            const taskList = new TaskList(result).set("tasks", tasks);

            this.saveList(taskList);

        }.bind(this));
        this.dispatch();
    }

    onNewTaskList(list) {
        this.saveList(new TaskList(list).set("tasks", new Immutable.List()));
        this.dispatch();
    }

    onTaskListMoved(payload) {
        const {list, targetList} = payload;

        if (list === undefined || targetList === undefined) {
            return;
        }
        const ordering = list.ordering,
              targetOrdering = targetList.ordering;

        this.saveList(this.getList(list.id).set("ordering", targetOrdering));
        this.saveList(this.getList(targetList.id).set("ordering", ordering));
        this.dispatch();

    }

    onUpdateTaskListName(payload) {

        const {list, name} = payload;

        this.saveList(this.getList(list.id).set("name", name));
        this.dispatch();
    }

    onToggleTaskListEditMode(list) {
        const rec = this.getList(list.id);
        this.saveList(rec.set("isEditing", !rec.isEditing));
        this.dispatch();
    }

    onNewTask(payload) {
        const {list, task} = payload;
        this.saveList(this.addTask(this.getList(list.id), new Task(task)));
        this.dispatch();
    }

    onTaskListRemoved(list) {
        this.taskListMap = this.taskListMap.delete(list.id);
        this.dispatch();
    }

    onTaskRemoved(task) {
        this.saveList(this.removeTask(task));
        this.dispatch();
    }

    onTaskMoved(payload) {
        const {list, task} = payload;

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
