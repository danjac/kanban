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
import Card from './Card';

import * as ActionCreators from '../actions';

const store = configureStore();

function mapStateToProps(state) {

  state = state.toJS();
  const isLoaded = state.isLoaded || false;

  const cards  = state.result
  .map(id => {
    return state.entities.cards[id]
  })
  .filter(card => card)
  .map(card => {
      let tasks = card.tasks
        .map(id => state.entities.tasks[id])
        .filter(task => task);
      card.tasks = tasks;
      return card;
  });
  return {
    cards,
    isLoaded
  };
}


class Board extends React.Component {

    render() {
        if (!this.props.isLoaded) {
            return  (
            <p className="text-center">
                <img alt="loading..." src="/static/images/ajax-loader.gif" />
            </p>
            );
        }
        const rows = _.chunk(this.props.cards, 4);
        return (
            <Grid>
            {rows.map((row, rowIndex) => {
            return (
                <Row key={rowIndex} style={{ minHeight: 320 }}>
                    {row.map((card, colIndex) => {
                        return (
                            <Col key={colIndex} xs={3}>
                                <Card key={card.id} card={card} actions={this.props.actions} />
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
      cards: PropTypes.array.isRequired,
      isLoaded: PropTypes.bool.isRequired,
      dispatch: PropTypes.func.isRequired
    }

    constructor(props) {
        super(props);
        const {dispatch} = this.props;
        this.handleNewCard = this.handleNewCard.bind(this);
        this.actions = bindActionCreators(ActionCreators, dispatch);
    }

    componentDidMount() {
        this.actions.getBoard();
    }

    handleNewCard(event) {
        event.preventDefault();
        const name = this.refs.name.getValue().trim();
        this.refs.name.getInputDOMNode().value = "";
        if (name) {
            this.actions.createCard(name);
        }
    }

    header() {
        return (

            <header className="container">
                <div className="page-header">
                    <h1 style={{ color: 'white'}}>Kanban 看板</h1>
                </div>
                <form onSubmit={this.handleNewCard}>
                    <Input ref="name"
                           type="text"
                           bsSize="large"
                           placeholder="Add a new card" />
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
                <Board actions={this.actions} {...this.props} />
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
