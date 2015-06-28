import express from 'express';
import {TaskList, Task} from './models';

const api = express.Router();

api.get("/board/", (req, res) => {
    TaskList
    .find({})
    .sort('ordering')
    .exec()
    .then((result) => {
        res.json({
            lists: result
        });
    });
});

api.post("/board/", (req, res) => {
    new TaskList({ name: req.body.name })
    .save()
    .then((result) => {
        res.json(result);
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
    .then((result) => {
        const [list, targetList] = result;
        const ordering = list.ordering;
        return Promise.all([
            list.update({
                ordering: targetList.ordering
            }),
            targetList.update({
                ordering: ordering
            })
        ])
    })
    .then(() => {
        res.status(200).end();
    });
});

export default api;