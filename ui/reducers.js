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
    console.log("board_loaded", action.board);
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
    const {taskList, task} = action;
    return state
      .mergeIn(["entities", "tasks", task.id], task)
      .updateIn(["entities", "taskLists", taskList.id, "tasks"], tasks => tasks.unshift(task.id));
  },

  [DELETE_TASKLIST]: (state, action) => {
    const {taskList} = action;
    return state.deleteIn(["entities", "taskLists", taskList.id]);
  },

  [DELETE_TASK]: (state, action) => {
    const {task} = action;
    return state.deleteIn(["entities", "tasks", task.id]);
  },

  [MOVE_TASKLIST]: (state, action) => {
    const {taskList, target} = action;
    const result = state.get("result", []),
        fromIndex = result.indexOf(taskList.id),
        toIndex = result.indexOf(target.id);

     return state.update(
       "result", 
       result => {
        return result
        .delete(fromIndex)
        .splice(toIndex, 0, taskList.id)
       });

  },

  [MOVE_TASK]: (state, action) => {
    const {list, task} = action;
    return state
    .updateIn(["entities", "taskLists", task.taskListId, "tasks"], tasks => {
      return tasks.filterNot(id => id === task.id);
    })
    .updateIn(["entities", "taskLists", list.id, "tasks"], tasks => {
      return tasks.unshift(task.id);
    });
  },

  [TASKLIST_EDIT_MODE]: (state, action) => {
    const {listToEdit} = action;
    return state
    .updateIn(["entities", "taskLists", listToEdit.id, "isEditing"], value => {
      return value ? false : true;
    });
  },

  [UPDATE_TASKLIST]: (state, action) => {
    const {taskList, name} = action;
    return state
    .setIn(["entities", "taskLists", taskList.id, "name"], name);
  }

}

export default function(state = initialState, action) {
  const fn = reducerMap[action.type];
  if (typeof(fn) === 'function') {
    return fn(state, action);
  }
  return state;
}
