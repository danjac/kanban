import api from './api';

import { ActionTypes } from './constants';

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


export function getBoard() {
  return dispatch => {
    api.getBoard()
    .then(taskLists => {
      dispatch(boardLoaded(taskLists))
    })
    .catch(err => console.log("err:", err));
  };

}

export function boardLoaded(taskLists) {
  return {
    type: BOARD_LOADED,
    taskLists: taskLists
  };
}

export function createTaskList(name) {
  return dispatch => {
    return api.newTaskList(name)
    .then(taskList => dispatch(newTaskList(taskList)));
  };

}

export function newTaskList(taskList) {
  return {
    type: TASKLIST_ADDED,
    taskList: taskList
  };
}

export function moveTaskList(taskList, target) {
  api.moveTaskList(taskList.id, target.id);
  return {
    type: MOVE_TASKLIST,
    taskList: taskList,
    target: target
  };
}

export function updateTaskListName(taskList) {
  api.updateTaskListName(taskList.id, taskList.name);
  return {
    type: UPDATE_TASKLIST,
    taskList: taskList
  };
}


export function deleteTaskList(taskList) {
  api.deleteTaskList(taskList.id);
  return {
    type: DELETE_TASKLIST,
    taskList: taskList
  };
}

export function createTask(list, text) {
  return dispatch => {
    return api.newTask(list.id, text)
    .then(task => dispatch(newTask(task)));
  };
}

export function toggleTaskListEditMode(list) {
  return {
    type: TASKLIST_EDIT_MODE,
    listToEdit: list
  };
}

export function updateTaskListName(list, name) {
  api.updateTaskListName(list.id, name);
  return {
    type:  UPDATE_TASKLIST,
    list: list,
    name: name
  }
}

export function newTask(task) {
  return {
    type: TASK_ADDED,
    task: task
  }
}

export function moveTask(list, task) {
  api.moveTask(list.id, task.id);
  return {
    type: MOVE_TASK,
    list: list,
    task: task
  };
}

export function deleteTask(task) {
  api.deleteTask(task.id);
  return {
    type: DELETE_TASK,
    task: task
  };
}
