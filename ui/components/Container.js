// code here
//require("./app.css");

import React from 'react';
import _ from 'lodash';
import {Grid, Row, Col, Input} from 'react-bootstrap';
import {DragDropContext} from 'react-dnd';
import HTML5Backend from 'react-dnd/modules/backends/HTML5';
import connectToStores from 'alt/utils/connectToStores';

import actions from '../actions/TaskListActions';
import TaskListStore from '../stores/TaskListStore';
import TaskList from './TaskList';

class TaskBoard extends React.Component {

    render() {
        if (!this.props.isLoaded) {
            return  (
            <p className="text-center">
                <img alt="loading..." src="/images/ajax-loader.gif" />
            </p>
            );
        }
        const rows = _.chunk(this.props.taskLists.toJS(), 4);
        return (
            <Grid>
            {rows.map((row, rowIndex) => {
            return (
                <Row key={rowIndex} style={{ minHeight: 320 }}>
                    {row.map((list, colIndex) => {
                        return (
                            <Col key={colIndex} xs={3}>
                                <TaskList key={list.id} list={list} />
                            </Col>
                        )
                    })}
                </Row>
            );
            })}
        </Grid>
        );
    }
}


@DragDropContext(HTML5Backend)
@connectToStores
export default class Container extends React.Component {

    static getStores() {
        return [TaskListStore];
    }

    static getPropsFromStores() {
        return TaskListStore.getState();
    }

    constructor(props) {
        super(props);
        this.handleNewList = this.handleNewList.bind(this);
    }

    componentDidMount() {
        actions.getBoard();
    }

    handleNewList(event) {
        event.preventDefault();
        const name = this.refs.name.getValue().trim();
        this.refs.name.getInputDOMNode().value = "";
        if (name) {
            actions.createTaskList(name);
        }
    }

    header() {
        return (

            <header className="container">
                <div className="page-header">
                    <h1 style={{ color: 'white'}}>Kanban Board 看板</h1>
                </div>
                <form onSubmit={this.handleNewList}>
                    <Input ref="name"
                           type="text"
                           bsSize="large"
                           placeholder="Add a new list" />
                </form>
            </header>
        );
    }

    footer() {
        return (
        <footer className="container">
            <p className="text-center">
                <small>
                    &copy; { new Date().getFullYear() } Dan Jacob <a target="_blank" href="https://github.com/danjac/kanban">Github</a>
                </small>
            </p>
        </footer>
        );

    }

    render() {
        return (
            <Grid>
                {this.header()}
                <TaskBoard {...this.props} />
                {this.footer()}
            </Grid>
        );
    }
}

