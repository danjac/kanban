import express from 'express';
import models from './models';

const api = express.Router();

api.get("/board/", (req, res, next) => {
    models.TaskList
    .findAll({
        include: [models.Task],
        order: [['ordering', 'ASC']]
    })
    .then(result => {
        res.json({
            lists: result
        });
    })
    .catch(err => next(err));
});

api.post("/board/", (req, res, next) => {
    models.TaskList
    .create({ name: req.body.name })
    .then(result => {
        res.json(result);
    })
    .catch(err => next(err));
});

api.post("/board/:id/add/", (req, res, next) => {
    models.Task
    .create({
        text: req.body.text,
        taskListId: req.params.id
    })
    .then(task => {
        res.json(task);
    })
    .catch(err => next(err));
});

api.delete("/board/:id", (req, res, next) => {
    // normally we'd just have cascade
    models.Task
    .destroy({
        where: { taskListId: req.params.id }
    })
    .then(() => {
        return models.TaskList.findById(req.params.id)
    })
    .then(list => {
        return list.destroy();
    })
    .then(() => {
        res.status(201).end();
    })
    .catch(err => next(err));
});

api.put("/board/:id", (req, res, next) => {
    models.TaskList
    .update({
        name: req.body.name
    },{
        where: { id: req.params.id }
    })
    .then(() => {
        res.status(200).end();
    })
    .catch(err => next(err));
});

api.put("/board/:id/move/:targetId", (req, res, next) => {
    Promise.all([
        models.TaskList.findById(req.params.id),
        models.TaskList.findById(req.params.targetId)
    ])
    .then(result => {
        const [list, targetList] = result;
        const ordering = list.ordering,
              targetOrdering = targetList.ordering;
        return Promise.all([
            list.update({ ordering: targetOrdering }),
            targetList.update({ ordering: ordering }),
        ])
    })
    .then(() => {
        res.status(200).end();
    })
    .catch(err => next(err));
});

api.put("/task/:id/move/:targetId", (req, res, next) => {
    Promise.all([
        models.Task.findById(req.params.id),
        models.TaskList.findById(req.params.targetId)
    ])
    .then(result => {
        const [task, target] = result;
        return task.update({
            taskListId: target.id
        });
    })
    .then(() => {
        res.status(200).end();
    })
    .catch(err => next(err));
});

api.delete("/task/:id", (req, res, next) => {
    models.Task
    .destroy({
        where: { id: req.params.id }
    })
    .then(() => {
        res.status(201).end();
    })
    .catch(err => next(err));
});

export default api;
