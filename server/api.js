import express from 'express';
import models from './models';

const api = express.Router();

api.get("/board/", (req, res, next) => {
    models.TaskList
    .findAll({
        include: [models.Task],
        order: ['ordering', 'ASC']
    })
    .then(result => {
        res.json({
            lists: result
        });
    })
    .catch(err => next(err));
});

api.post("/board/", (req, res, next) => {
    new TaskList({ name: req.body.name })
    .save()
    .then(result => {
        res.json(result);
    }, err => next(err));
});

api.post("/board/:id/add/", (req, res, next) => {
    TaskList
    .findById(req.params.id)
    .then(list => {
        return list.addTask(new Task({ text: req.body.text }));
    })
    .then(task => {
        res.json(task);
    }, err => next(err));

});

api.delete("/board/:id", (req, res, next) => {
    TaskList
    .findByIdAndRemove(req.params.id)
    .then(() => {
        res.status(201).end();
    }, err => next(err));
});

api.put("/board/:id", (req, res, next) => {
    TaskList
    .findByIdAndUpdate(req.params.id, {
        name: req.body.name
    })
    .then(() => {
        res.status(200).end();
    }, err => next(err));
});

api.put("/board/:id/move/:targetId", (req, res, next) => {
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
    }, err => next(err));
});

api.put("/task/:id/move/:targetId", (req, res, next) => {
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
    }, err => next(err));
});

api.delete("/task/:id", (req, res, next) => {
    Task
    .findByIdAndRemove(req.params.id)
    .then(() => {
        res.status(201).end();
    }, err => next(err));
});

export default api;
