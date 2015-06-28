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
        res.status(201);
    });
});

export default api;