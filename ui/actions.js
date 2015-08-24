/* jslint ignore:start */

import * as api from './api';

import { ActionTypes } from './constants';

const {
  BOARD_LOADED,
  CARD_ADDED,
  UPDATE_CARD,
  MOVE_CARD,
  DELETE_CARD,
  CARD_EDIT_MODE,
  TASK_ADDED,
  MOVE_TASK,
  DELETE_TASK
} = ActionTypes;


export function getBoard() {
  return dispatch => {
    api.getBoard()
    .then(cards => {
      dispatch(boardLoaded(cards))
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

export function createCard(name) {
  return dispatch => {
    return api.newCard(name)
    .then(card => dispatch(newCard(card)));
  };

}

export function newCard(card) {
  return {
    type: CARD_ADDED,
    card: card
  };
}

export function moveCard(id, targetId) {
  api.moveCard(id, targetId);
  return {
    type: MOVE_CARD,
    id: id,
    targetId: targetId
  };
}

export function updateCardName(id, name) {
  api.updateCardName(id, name);
  return {
    type: UPDATE_CARD,
    id: id,
    name: name
  };
}


export function deleteCard(id) {
  api.deleteCard(id);
  return {
    type: DELETE_CARD,
    id: id
  };
}

export function createTask(id, text) {
  return dispatch => {
    return api.newTask(id, text)
    .then(task => dispatch(newTask(id, task)));
  };
}

export function toggleCardEditMode(id) {
  return {
    type: CARD_EDIT_MODE,
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
