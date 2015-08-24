/* jslint ignore:start */
//import { combineReducers } from 'redux';

import Immutable from 'immutable';
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

const initialState = Immutable.fromJS({
    entities: {
      taskLists: [],
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

  [TASKLIST_ADDED]: (state, action) => {
    const {taskList} = action;
    return state
      .mergeIn(["entities", "taskLists", taskList.id], taskList)
      .update("result", result => result.unshift(taskList.id));
  },

  [TASK_ADDED]: (state, action) => {
    const {id, task} = action;
    return state
      .mergeIn(["entities", "tasks", task.id], task)
      .updateIn(["entities", "taskLists", id, "tasks"], tasks => tasks.unshift(task.id));
  },

  [DELETE_TASKLIST]: (state, action) => {
    const {id} = action;
    return state.deleteIn(["entities", "taskLists", id]);
  },

  [DELETE_TASK]: (state, action) => {
    const {id} = action;
    return state.deleteIn(["entities", "tasks", id]);
  },

  [MOVE_TASKLIST]: (state, action) => {
    const {id, targetId} = action;
    const result = state.get("result", []),
        fromIndex = result.indexOf(id),
        toIndex = result.indexOf(targetId);

     return state.update(
       "result", 
       result => {
        return result
        .delete(fromIndex)
        .splice(toIndex, 0, id)
       });

  },

  [MOVE_TASK]: (state, action) => {
    const {from, to, id} = action;
    return state
    .updateIn(["entities", "taskLists", from, "tasks"], tasks => {
      return tasks.filterNot(_id => _id === id);
    })
    .updateIn(["entities", "taskLists", to, "tasks"], tasks => {
      return tasks.unshift(id);
    });
  },

  [TASKLIST_EDIT_MODE]: (state, action) => {
    const {id} = action;
    return state
    .updateIn(["entities", "taskLists", id, "isEditing"], value => {
      return value ? false : true;
    });
  },

  [UPDATE_TASKLIST]: (state, action) => {
    const {id, name} = action;
    return state
    .setIn(["entities", "taskLists", id, "name"], name);
  }

}

export default function(state = initialState, action) {
  const fn = reducerMap[action.type];
  if (typeof(fn) === 'function') {
    return fn(state, action);
  }
  return state;
}
