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
                tasks = tasks.push(new Task({
                    id: task.id,
                    text: task.text,
                    taskListId: task.taskListId
                }));
            });

            const rec = new TaskList({
                id: result.id,
                name: result.name,
                tasks: tasks
            });

            this.taskListMap = this.taskListMap.set(result.id, new TaskList({
                id: result.id,
                name: result.name,
                tasks: tasks
            }));

        }.bind(this));
        this.dispatch();
    }

    onNewTaskList(list) {
        this.updateList(new TaskList(list).set("tasks", Immutable.List()));
        this.dispatch();
    }

    onUpdateTaskListName(payload) {
        const {list, name} = payload;
        this.updateList(this.getList(list.id).set("name", name));
        this.dispatch();
    }

    onToggleTaskListEditMode(list) {
        const rec = this.getList(list.id);
        this.updateList(rec.set("isEditing", !rec.isEditing));
        this.dispatch();
    }

    onNewTask(payload) {
        const {list, task} = payload;
        this.updateList(this.addTask(this.getList(list.id), new Task(task)));
        this.dispatch();
    }

    onTaskListRemoved(list) {
        this.taskListMap = this.taskListMap.delete(list.id);
        this.dispatch();
    }

    onTaskRemoved(task) {
        this.updateList(this.removeTask(task));
        this.dispatch();
    }

    onTaskMoved(payload) {
        const {list, task} = payload;

        this.updateList(this.removeTask(task));
        const newTaskRec = new Task(task).set("taskListId", list.id);
        this.updateList(this.addTask(this.getList(list.id), newTaskRec));

        this.dispatch();
    }

    updateList(newList) {
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
