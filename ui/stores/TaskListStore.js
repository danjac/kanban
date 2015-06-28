import _ from 'lodash';
import alt from '../flux';
import actions from '../actions/TaskListActions';

class TaskListStore {
    constructor() {

        this.bindActions(actions);
        this.taskLists = [];
        this.isLoaded = false;

    }

    getBoard(taskLists) {
        this.taskLists = taskLists || [];
        this.isLoaded = true;
    }

    createTaskList(list) {
        this.taskLists.push(list);
    }

    moveTaskList({list, targetList}) {

        if (list === undefined || targetList === undefined) {
            return;
        }
        if (list._id === targetList._id) {
            return;
        }
        const ordering = list.ordering,
              targetOrdering = targetList.ordering;

        this.taskLists.map((item) => {
            if (item._id === list._id) {
                item.ordering = targetOrdering;
            } else if (item._id === targetList._id) {
                item.ordering = ordering;
            }
        });

        this.taskLists = _.sortBy(this.taskLists, (item) => {
            return item.ordering;
        });
    }

    updateTaskListName({list, name}) {
        this.updateList(list._id, (found) => found.name = name);
    }

    toggleTaskListEditMode(list) {
        this.updateList(list._id, (found) => found.isEditing = !found.isEditing);
    }

    createTask({list, task}) {
        this.updateList(list._id, (found) => {
            found.tasks = found.tasks || [];
            found.tasks.unshift(task);
        });
    }

    deleteTaskList(list) {
        this.taskLists = _.remove(this.taskLists, (item) => item._id !== list._id);
    }

    deleteTask(task) {
        this.updateList(task.taskListId, (found) => {
            found.tasks = _.remove(found.tasks, (item) => item._id !== task._id);
        });
    }

    moveTask({list, task}) {
        this.deleteTask(task);
        task.taskListId = list._id;
        this.createTask({list, task});
    }

    updateList(listId, cb) {
        const found = _.find(this.taskLists, (item) => item._id === listId);
        if (found) {
            cb(found);
        }
    }


}

export default alt.createStore(TaskListStore);
