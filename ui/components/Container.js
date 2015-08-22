/* jslint ignore:start */
// code here
//require("./app.css");

import _ from 'lodash';
import React, {PropTypes} from 'react';
import {bindActionCreators} from 'redux';
import {Provider, connect} from 'react-redux';
import {Grid, Row, Col, Input} from 'react-bootstrap';
import {DragDropContext} from 'react-dnd';
import HTML5Backend from 'react-dnd/modules/backends/HTML5';

import configureStore from '../store';
import TaskList from './TaskList';

import * as ActionCreators from '../actions';

const store = configureStore();

function mapStateToProps(state) {
  const taskLists  = state.taskLists || [],
        isLoaded = state.isLoaded || false;
  return {
    taskLists,
    isLoaded
  };
}


class TaskBoard extends React.Component {

    render() {
        if (!this.props.isLoaded) {
            return  (
            <p className="text-center">
                <img alt="loading..." src="/static/images/ajax-loader.gif" />
            </p>
            );
        }
        const rows = _.chunk(this.props.taskLists, 4);
        return (
            <Grid>
            {rows.map((row, rowIndex) => {
            return (
                <Row key={rowIndex} style={{ minHeight: 320 }}>
                    {row.map((list, colIndex) => {
                        return (
                            <Col key={colIndex} xs={3}>
                                <TaskList key={list.id} list={list} actions={this.props.actions} />
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
@connect(mapStateToProps)
class Container extends React.Component {

    static propTypes = {
      taskLists: PropTypes.array.isRequired,
      isLoaded: PropTypes.bool.isRequired,
      dispatch: PropTypes.func.isRequired
    }

    constructor(props) {
        super(props);
        const {dispatch} = this.props;
        this.handleNewList = this.handleNewList.bind(this);
        this.actions = bindActionCreators(ActionCreators, dispatch);
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
                    <h1 style={{ color: 'white'}}>Kanban 看板</h1>
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
                <TaskBoard actions={this.actions} {...this.props} />
                {this.footer()}
            </Grid>
        );
    }
}

export default class Root extends React.Component {
  render() {
    return (
      <Provider store={store}>
      {() => <Container />}
      </Provider>
    );
  }
}
