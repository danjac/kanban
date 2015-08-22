//import { combineReducers } from 'redux';
import _ from 'lodash';

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

const initialState = {
  taskLists: [],
  isLoaded: false
};


function updateTaskList(state, action) {
  const { list, name } = action;
  return _.map(state.taskLists, l => {
    if (l.id == list.id) {
      l.name = name;
    }
    return l;
  });
}

function moveTask(state, action) {
  const { list, task } = action;
  let taskLists = deleteTask(state, task);
  task.taskListId = list.id;
  return addTask(taskLists, task);
}

function moveTaskList(state, action) {
  const { taskList, target } = action;

  const newTargetOrder = taskList.ordering;
  const newTaskListOrder = target.ordering;

  const taskLists = _.map(state.taskLists, list => {
    if (list.id === taskList.id) {
      list.ordering = newTaskListOrder;
    } else if (list.id == target.id) {
      list.ordering = newTargetOrder;
    }
    return list;
  });

  return _.sortBy(taskLists, "ordering");
}

function addTask(taskLists, task) {

  return _.map(taskLists, list => {
    if (list.id === task.taskListId) {
      list.tasks = list.tasks || [];
      list.tasks.unshift(task);
    }
    return list;
  });

}

function deleteTask(state, task) {

  return _.map(state.taskLists, list => {
    list.tasks = (list.tasks || []).filter(t => t.id !== task.id);
    return list;
  });

}

function toggleEditMode(state, action) {
  const { listToEdit } = action;
  return _.map(state.taskLists, list => {
    if (listToEdit.id === list.id) {
      list.isEditing = !list.isEditing;
    }
    return list;
  });
}

export default function(state=initialState, action) {
  switch (action.type) {

    case BOARD_LOADED:
      return _.assign({}, state, {
        taskLists: action.taskLists || [],
        isLoaded: true
      });

    case TASKLIST_ADDED:
      return _.assign({}, state, {
        taskLists: [action.taskList, ...state.taskLists]
    });

    case DELETE_TASKLIST:
      return _.assign({}, state, {
        taskLists: state.taskLists.filter(todo => action.taskList.id !== todo.id)
      });

    case MOVE_TASKLIST:
      return _.assign({}, state, {
        taskLists: moveTaskList(state, action)
      });

    case UPDATE_TASKLIST:
      return _.assign({}, state, { taskLists: updateTaskList(state, action) });

    case TASKLIST_EDIT_MODE:
      return _.assign({}, state, { taskLists: toggleEditMode(state, action) });

 
    case TASK_ADDED: 
      return _.assign({}, state, { taskLists: addTask(state.taskLists, action.task) });

    case DELETE_TASK:
      return _.assign({}, state, { taskLists: deleteTask(state, action.task) });

    case MOVE_TASK:
      return _.assign({}, state, { taskLists: moveTask(state, action) });

    default:
      return state;
  }
}

/*
export default combineReducers({
  board
});
*/
