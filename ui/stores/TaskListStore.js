import Immutable from 'immutable';
import {Store} from 'flummox';


const TaskList = Immutable.Record({
    id: undefined,
    name: '',
    isEditing: false,
    tasks: Immutable.List()
});


const Task = Immutable.Record({
    id: undefined,
    text: '',
    taskListId: undefined
});


export default class TaskListStore extends Store {
    constructor(flux) {
        super();

        const actions = flux.getActions('taskLists');

        this.register(actions.getBoard, this.onNewBoard);
        this.register(actions.createTaskList, this.onNewTaskList);
        this.register(actions.createTask, this.onNewTask);
        this.register(actions.moveTask, this.onTaskMoved);
        this.register(actions.deleteTask, this.onTaskRemoved);
        this.register(actions.deleteTaskList, this.onTaskListRemoved);
        this.register(actions.updateTaskListName, this.onUpdateTaskListName);
        this.register(actions.toggleTaskListEditMode, this.onToggleTaskListEditMode);

        this.taskListMap = Immutable.OrderedMap();

        this.state = {
            taskLists: Immutable.List()
        };

    }

    onNewBoard(taskLists) {
        this.taskListMap = this.taskListMap.clear();
        taskLists.forEach((result) => {

            let tasks = Immutable.List();

            result.tasks.forEach((task) => {
                tasks = tasks.push(new Task(task));
            });

            const taskList = new TaskList(result).set("tasks", tasks);
            this.saveList(taskList);

        }.bind(this));
        this.dispatch();
    }

    onNewTaskList(list) {
        this.saveList(new TaskList(list).set("tasks", Immutable.List()));
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
        this.setState({ taskLists:  this.taskListMap.toList() });
    }

}
