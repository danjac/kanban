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
        this.taskLists = taskLists;
        this.isLoaded = true;
    }

    createTaskList(list) {
        this.taskLists.push(list);
    }

    moveTaskList({list, targetList}) {

        if (list === undefined || targetList === undefined) {
            return;
        }
        if (list.id === targetList.id) {
            return;
        }
        const ordering = list.ordering,
              targetOrdering = targetList.ordering;

        this.taskLists.map((item) => {
            if (item.id === list.id) {
                item.ordering = targetOrdering;
            } else if (item.id === targetList.id) {
                item.ordering = ordering;
            }
        });

        this.taskLists = _.sortBy(this.taskLists, (item) => {
            return item.ordering;
        });
    }

    updateTaskListName({list, name}) {
        this.updateList(list.id, (found) => found.name = name);
    }

    toggleTaskListEditMode(list) {
        this.updateList(list.id, (found) => found.isEditing = !found.isEditing);
    }

    createTask({list, task}) {
        this.updateList(list.id, (found) => {
            found.tasks = found.tasks || [];
            found.tasks.unshift(task);
        });
    }

    deleteTaskList(list) {
        this.taskLists = _.remove(this.taskLists, (item) => item.id !== list.id);
    }

    deleteTask(task) {
        this.updateList(task.taskListId, (found) => {
            found.tasks = _.remove(found.tasks, (item) => item.id !== task.id);
        });
    }

    moveTask({list, task}) {
        this.deleteTask(task);
        task.taskListId = list.id;
        this.createTask({list, task});
    }

    updateList(listId, cb) {
        const found = _.find(this.taskLists, (item) => item.id === listId);
        if (found) {
            cb(found);
        }
    }


}

export default alt.createStore(TaskListStore);
