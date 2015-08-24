/* jshint ignore:start */

import { Schema, arrayOf, normalize } from 'normalizr';
import fetch from 'isomorphic-fetch';

import {API_URL} from './constants';

const cardSchema = new Schema('cards');
const taskSchema = new Schema('tasks');

cardSchema.define({
  tasks: arrayOf(taskSchema)
});

taskSchema.define({
  card: cardSchema
});

const jsonHeaders = {
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
};

export function getBoard() {
  return fetch(`${API_URL}/board/`)
  .then(response => response.json())
  .then(body => normalize(body.cards, arrayOf(cardSchema)));
}

export function newCard(name) {
  return fetch(`${API_URL}/board/`, {
    ...jsonHeaders,
    method: 'POST',
    body: JSON.stringify({
      name: name
    })
  })
  .then(response => response.json());
}

export function updateCardName(id, name) {
  return fetch(`${API_URL}/board/${id}/`, {
    ...jsonHeaders, 
    method: 'PUT',
    body: JSON.stringify({
      name: name
    })
  });
}

export function newTask(id, text) {
  return fetch(`${API_URL}/board/${id}/add/`, {
    ...jsonHeaders,
    method: 'POST',
    body: JSON.stringify({
      text: text
    })
  })
  .then(response => response.json());
}

export function deleteCard(id) {
  return fetch(`${API_URL}/board/${id}/`, {
    method: 'DELETE'
  });
}


export function deleteTask(id) {
  return fetch(`${API_URL}/task/${id}/`, {
    method: 'DELETE'
  });
}

export function moveCard(id, targetId) {
  return fetch(`${API_URL}/board/${id}/move/${targetId}`, {
    method: 'PUT'
  });
}

export function moveTask(targetId, id) {
  return fetch(`${API_URL}/task/${id}/move/${targetId}`, {
    method: 'PUT'
  });
}

