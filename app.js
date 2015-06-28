import http from 'http';
import path from 'path';
import express from 'express';
import bodyParser from 'body-parser';
import logger from 'morgan';
import errorHandler from 'errorhandler';
import methodOverride from 'method-override';
import mongoose from 'mongoose';

import config from './config';
import api from './api';

mongoose.connect(config.db);

const app = express();

app.set('port', process.env.port || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(methodOverride());
app.use(errorHandler());

app.use(express.static(path.join(__dirname, 'public')));

app.get("/", (req, res) => {
    res.render('index', {
        'devMode': true
    });
});

app.use("/api/v1", api);

http.createServer(app).listen(app.get('port'), () => {
    console.log(`server listening on port ${app.get('port')}`);
});

