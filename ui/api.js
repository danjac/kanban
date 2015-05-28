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
        .then((res) => {
            return res.body.lists;
        });
    }

    newTaskList(name) {
        return request
        .post("/board/")
        .set("Content-Type", "application/json")
        .send({ name: name })
        .use(this.prefix)
        .send({ name: name })
        .end()
        .then((res) => {
            return res.body;
        });
    }

    newTask(listId, text) {
        return request
        .post("/board/" + listId + "/add/")
        .set("Content-Type", "application/json")
        .use(this.prefix)
        .send({ text: text })
        .end()
        .then((res) => {
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

    moveTask(listId, taskId) {
        return request
        .put("/task/" + taskId + "/move/" + listId)
        .use(this.prefix)
        .end();
    }
}

export default new Api();
