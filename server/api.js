import express from 'express';
import {TaskList, Task} from './models';

const api = express.Router();

api.get("/board/", (req, res) => {
    TaskList
    .find({})
    .populate('tasks')
    .sort('ordering')
    .exec()
    .then(result => {
        res.json({
            lists: result
        });
    });
});

api.post("/board/", (req, res) => {
    new TaskList({ name: req.body.name })
    .save()
    .then(result => {
        res.json(result);
    });
});

api.post("/board/:id/add/", (req, res) => {
    TaskList
    .findById(req.params.id)
    .then(list => {
        return list.addTask(new Task({ text: req.body.text }));
    })
    .then(task => {
        res.json(task);
    });

});

api.delete("/board/:id", (req, res) => {
    TaskList
    .findByIdAndRemove(req.params.id)
    .then(() => {
        res.status(201).end();
    });
});

api.put("/board/:id", (req, res) => {
    TaskList
    .findByIdAndUpdate(req.params.id, {
        name: req.body.name
    })
    .then(() => {
        res.status(200).end();
    });
});

api.put("/board/:id/move/:targetId", (req, res) => {
    Promise.all([
        TaskList.findById(req.params.id),
        TaskList.findById(req.params.targetId)
    ])
    .then(result => {
        const [list, targetList] = result;
        return list.move(targetList);
    })
    .then(() => {
        res.status(200).end();
    });
});

api.put("/task/:id/move/:targetId", (req, res) => {
    Promise.all([
        Task.findById(req.params.id),
        TaskList.findById(req.params.targetId)
    ])
    .then(result => {
        const [task, target] = result;
        return task.move(target);
    })
    .then(() => {
        res.status(200).end();
    });
});

api.delete("/task/:id", (req, res) => {
    Task
    .findByIdAndRemove(req.params.id)
    .then(() => {
        res.status(201).end();
    });
});
export default api;
