/* jslint ignore:start */

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
    }).
    catch(err => console.log(err));
  };

}

export function boardLoaded(board) {
  return {
    type: BOARD_LOADED,
    board: board
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

export function moveTaskList(id, targetId) {
  api.moveTaskList(id, targetId);
  return {
    type: MOVE_TASKLIST,
    id: id,
    targetId: targetId
  };
}

export function updateTaskListName(id, name) {
  api.updateTaskListName(id, name);
  return {
    type: UPDATE_TASKLIST,
    id: id,
    name: name
  };
}


export function deleteTaskList(id) {
  api.deleteTaskList(id);
  return {
    type: DELETE_TASKLIST,
    id: id
  };
}

export function createTask(id, text) {
  return dispatch => {
    return api.newTask(id, text)
    .then(task => dispatch(newTask(id, task)));
  };
}

export function toggleTaskListEditMode(id) {
  return {
    type: TASKLIST_EDIT_MODE,
    id: id
  };
}

export function newTask(id, task) {
  return {
    type: TASK_ADDED,
    id: id,
    task: task
  }
}

export function moveTask(from, to, id) {
  api.moveTask(to, id);
  return {
    type: MOVE_TASK,
    from: from,
    to: to,
    id: id
  };
}

export function deleteTask(id) {
  api.deleteTask(id);
  return {
    type: DELETE_TASK,
    id: id
  };
}
