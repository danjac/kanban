/* jslint ignore:start */
import { combineReducers } from 'redux';

import Immutable from 'immutable';
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

const initialState = Immutable.fromJS({
    entities: {
      cards: [],
      tasks: []
    },
    result: [],
    isLoaded: false
});
const reducerMap = {

  [BOARD_LOADED]: (state, action) => {
    return state.merge({
      isLoaded: true,
      ...action.board
    });
  },

  [CARD_ADDED]: (state, action) => {
    const {card} = action;
    return state
      .mergeIn(["entities", "cards", card.id], card)
      .update("result", result => result.push(card.id));
  },

  [TASK_ADDED]: (state, action) => {
    const {id, task} = action;
    return state
      .mergeIn(["entities", "tasks", task.id], task)
      .updateIn(["entities", "cards", id, "tasks"], tasks => tasks.unshift(task.id));
  },

  [DELETE_CARD]: (state, action) => {
    const {id} = action;
    return state.deleteIn(["entities", "cards", id]);
  },

  [MOVE_CARD]: (state, action) => {
    const {id, targetId} = action;
    const result = state.get("result", []),
        fromIndex = result.indexOf(id),
        toIndex = result.indexOf(targetId);

     return state.update(
       "result",
       result => {
        return result
        .delete(toIndex)
        .splice(toIndex, 0, id)
        .delete(fromIndex)
        .splice(fromIndex, 0, targetId);
       });

  },

  [CARD_EDIT_MODE]: (state, action) => {
    const {id} = action;
    return state
    .updateIn(["entities", "cards", id, "isEditing"], value => {
      return value ? false : true;
    });
  },

  [UPDATE_CARD]: (state, action) => {
    const {id, name} = action;
    return state
    .setIn(["entities", "cards", id, "name"], name);
  },

  [DELETE_TASK]: (state, action) => {
    const {id} = action;
    return state.deleteIn(["entities", "tasks", id]);
  },

  [MOVE_TASK]: (state, action) => {
    const {from, to, id} = action;
    return state
    .updateIn(["entities", "cards", from, "tasks"], tasks => {
      return tasks.filterNot(_id => _id === id);
    })
    .updateIn(["entities", "cards", to, "tasks"], tasks => {
      return tasks.unshift(id);
    });
  }

};

function createReducer(reducerMap, initialState) {
  return (state=initialState, action) => {
    const fn = reducerMap[action.type];
    if (typeof(fn) === 'function') {
      return fn(state, action);
    }
    return state;
  }
}

export default createReducer(reducerMap, initialState);
