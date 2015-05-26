// code here
//require("./app.css");

import React from 'react';
import FluxComponent from 'flummox/component';
import {Grid, Row, Col, Input} from 'react-bootstrap';
import {DragDropContext} from 'react-dnd';
import HTML5Backend from 'react-dnd/modules/backends/HTML5';

import TaskList from './TaskList';


class TaskBoard extends React.Component {
    render() {
        return (
            <Grid>
            <Row>
                <Col xs={6} md={6}>
                {this.props.taskLists.map((list) => {
                    return <TaskList flux={this.props.flux} key={list.id} list={list} />;
                })}
            </Col>
            </Row>
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

    render() {
        return (
            <div className="container">
                <h1>Kanban Board</h1>
                <form onSubmit={this.handleNewList}>
                    <Input ref="name"
                           type="text"
                           bsSize="large"
                           placeholder="Add a new list" />
                </form>
                <FluxComponent flux={this.props.flux} connectToStores={['taskLists']}>
                    <TaskBoard />
                </FluxComponent>
            </div>
        );
    }
}

