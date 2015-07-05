import request from 'superagent-promise';
import prefix from 'superagent-prefix';

class Api {
    constructor() {
        this.prefix = prefix('/api/v1');
    }

    getBoard() {
        return request
        .get("/board/")
        .use(this.prefix)
        .end()
        .then(res => {
            return res.body.lists;
        });
    }

    newTaskList(name) {
        return request
        .post("/board/")
        .use(this.prefix)
        .set("Content-Type", "application/json")
        .send({ name: name })
        .end()
        .then(res => {
            return res.body;
        });
    }

    updateTaskListName(listId, name) {
        return request
        .put("/board/" + listId + "/")
        .use(this.prefix)
        .set("Content-Type", "application/json")
        .send({ name: name })
        .end()
    }

    newTask(listId, text) {
        return request
        .post("/board/" + listId + "/add/")
        .use(this.prefix)
        .set("Content-Type", "application/json")
        .send({ text: text })
        .end()
        .then(res => {
            return res.body;
        });
    }

    deleteTaskList(listId) {
        return request
        .del("/board/" + listId)
        .use(this.prefix)
        .end();
    }

    deleteTask(taskId) {
        return request
        .del("/task/" + taskId)
        .use(this.prefix)
        .end();
    }

    moveTaskList(listId, targetListId) {
        return request
        .put("/board/" + listId + "/move/" + targetListId)
        .use(this.prefix)
        .end();
    }

    moveTask(listId, taskId) {
        return request
        .put("/task/" + taskId + "/move/" + listId)
        .use(this.prefix)
        .end();
    }
}

export default new Api();
