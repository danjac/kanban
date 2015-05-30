import React from 'react';
import expect from 'expect';
import AppFlux from '../../ui/flux';
import TaskListStore from '../../ui/stores/TaskListStore';


describe('task list store', function() {

    it('should be initialized from list of task lists', function() {
        const lists = [
                {
                    id: 1,
                    name: 'QA',
                    tasks: [
                        {
                            id: 1,
                            text: 'task1',
                            taskListId: 1
                        },
                        {
                            id: 2,
                            text: 'task2',
                            taskListId: 1
                        }
                     ]
                },
                {
                    id: 2,
                    name: 'Bugs',
                    tasks: [
                        {
                            id: 3,
                            text: 'task3',
                            taskListId: 2
                        },
                        {
                            id: 4,
                            text: 'task4',
                            taskListId: 2
                        }
                     ]
                }

            ];
        const flux = new AppFlux();
        const store = flux.getStore("taskLists");
        store.onNewBoard(lists);
        expect(store.state.taskLists.size).toBe(2);
    });
});



