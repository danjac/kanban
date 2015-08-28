import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import loggingMiddleware from 'redux-logger';
import reducer from './reducers';

const createStoreWithMiddleware = applyMiddleware(
  thunkMiddleware,
  loggingMiddleware
)(createStore);

console.log("reducer", reducer);

export default function configureStore(initialState) {
  return createStoreWithMiddleware(reducer, initialState);
}
