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
        })
        .catch((err) => {
            console.log(err);
        });
    }

    newTaskList(name) {
        return request
        .post("/board/")
        .set("Content-Type", "application/json")
        .send({ name: name })
        .use(this.prefix)
        .send({ name: name })
        .end();
    }

    newTask(name, task) {
        return request
        .put("/task/" + name)
        .set("Content-Type", "application/json")
        .use(this.prefix)
        .send({ text: task })
        .end();
    }

    deleteTask(name, index) {
        return request
        .del("/" + name + "/task/" + index)
        .use(this.prefix)
        .end();
    }

    moveTask(oldName, newName, index) {
        return request
        .put("/move/" + oldName + "/" + newName + "/" + index)
        .use(this.prefix)
        .end();
    }
}

export default new Api();


