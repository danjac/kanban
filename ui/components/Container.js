// code here
//require("./app.css");

import React from 'react';
import FluxComponent from 'flummox/component';
import _ from 'lodash';
import {Grid, Row, Col, Input} from 'react-bootstrap';
import {DragDropContext} from 'react-dnd';
import HTML5Backend from 'react-dnd/modules/backends/HTML5';

import TaskList from './TaskList';


class TaskBoard extends React.Component {

    render() {

        const rows = _.chunk(this.props.taskLists.toJS(), 4);
        return (
            <Grid>
            {rows.map((row) => {
            return (
                <Row style={{ minHeight: 320 }}>
                    {row.map((list) => {
                        return (
                            <Col xs={3}>
                                <TaskList flux={this.props.flux} key={list.id} list={list} />
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
export default class Container extends React.Component {

    constructor(props) {
        super(props);
        this.actions = props.flux.getActions('taskLists');
        this.handleNewList = this.handleNewList.bind(this);
    }

    componentDidMount() {
        this.actions.getBoard();
    }

    handleNewList(event) {
        event.preventDefault();
        const name = this.refs.name.getValue().trim();
        this.refs.name.getInputDOMNode().value = "";
        if (name) {
            this.actions.createTaskList(name);
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
                <FluxComponent flux={this.props.flux} connectToStores={['taskLists']}>
                    <TaskBoard />
                </FluxComponent>
                {this.footer()}
            </Grid>
        );
    }
}

