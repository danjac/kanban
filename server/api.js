import express from 'express';
import models from './models';

const api = express.Router();

function notFound(msg) {
    const e = new Error(msg || "Object not found");
    e.statusCode = 404;
    throw e;
}

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
        taskListId: parseInt(req.params.id)
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
        if (list) {
            return list.destroy();
        }
        notFound();
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
        if (list && targetList) {
            return Promise.all([
                list.update({ ordering: targetOrdering }),
                targetList.update({ ordering: ordering }),
            ])
        }
        notFound();
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
        if (task && target) {
            return task.update({
                taskListId: target.id
            });
        }
        notFound();
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
