import {Flux} from 'flummox';

import TaskListActions from './actions/TaskListActions';
import TaskListStore from './stores/TaskListStore';

export default class AppFlux extends Flux {
    constructor() {
        super();
        this.createActions('taskLists', TaskListActions);
        this.createStore('taskLists', TaskListStore, this);
    }
}
