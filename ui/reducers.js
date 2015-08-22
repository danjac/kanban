/* jslint ignore:start */
//import { combineReducers } from 'redux';
import _ from 'lodash';

import {
    ActionTypes
}
from './constants';

const {
    BOARD_LOADED,
    TASKLIST_ADDED,
    UPDATE_TASKLIST,
    MOVE_TASKLIST,
    DELETE_TASKLIST,
    TASKLIST_EDIT_MODE,
    TASK_ADDED,
    MOVE_TASK,
    DELETE_TASK
} = ActionTypes;

const initialState = {
    taskLists: [],
    isLoaded: false
};

function updateTaskList(taskLists, list, name) {
    return taskLists.map(l => {
        if (l.id == list.id) {
            l.name = name;
        }
        return l;
    });
}

function moveTask(taskLists, taskList, task) {
    taskLists = deleteTask(taskLists, task);
    task.taskListId = taskList.id;
    return addTask(taskLists, task);
}

function moveTaskList(taskLists, taskList, target) {

    const newTargetOrder = taskList.ordering,
        newTaskListOrder = target.ordering;

    taskLists = taskLists.map(list => {
        if (list.id === taskList.id) {
            list.ordering = newTaskListOrder;
        } else if (list.id == target.id) {
            list.ordering = newTargetOrder;
        }
        return list;
    });

    taskLists.sort((left, right) => left.ordering === right.ordering ? 0 : (
        left.ordering > right.ordering ? -1 : 1));
    return taskLists;
}

function addTask(taskLists, task) {

    return taskLists.map(list => {
        if (list.id === task.taskListId) {
            list.tasks = list.tasks || [];
            list.tasks.unshift(task);
        }
        return list;
    });

}

function deleteTask(taskLists, task) {

    return taskLists.map(list => {
        list.tasks = (list.tasks || []).filter(t => t.id !== task.id);
        return list;
    });

}

function toggleEditMode(taskLists, listToEdit) {
    return taskLists.map(list => {
        if (listToEdit.id === list.id) {
            list.isEditing = !list.isEditing;
        }
        return list;
    });
}

export default function(state = initialState, action) {
    switch (action.type) {

        case BOARD_LOADED:
            return {
                ...state,
                taskLists: action.taskLists || [],
                    isLoaded: true
            };

        case TASKLIST_ADDED:
            return {
                ...state,
                taskLists: [action.taskList, ...state.taskLists]
            };

        case DELETE_TASKLIST:
            return {
                ...state,
                taskLists: state.taskLists.filter(todo => action.taskList.id !==
                    todo.id)
            };

        case MOVE_TASKLIST:
            return {
                ...state,
                taskLists: moveTaskList(state.taskLists, action.taskList,
                    action.target)
            };

        case UPDATE_TASKLIST:
            return {
                ...state,
                taskLists: updateTaskList(state.taskLists, action.list, action.name)
            };

        case TASKLIST_EDIT_MODE:
            return {
                ...state,
                taskLists: toggleEditMode(state.taskLists, action.listToEdit)
            };

        case TASK_ADDED:
            return {
                ...state,
                taskLists: addTask(state.taskLists, action.task)
            }

        case DELETE_TASK:
            return {
                ...state,
                taskLists: deleteTask(state.taskLists, action.task)
            };

        case MOVE_TASK:
            return {
                ...state,
                taskLists: moveTask(state.taskLists, action.list, action.task)
            };

        default:
            return state;
    }
}


/*
export default combineReducers({
  board
});
*/
