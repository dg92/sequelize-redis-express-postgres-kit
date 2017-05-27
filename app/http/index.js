import express from 'express';
import bodyParser from 'body-parser';
import errorhandler from 'errorhandler';
import cors from 'cors';
import multer from 'multer';

import auth from './auth';
import {loggedIn} from 'app/auth/filters';
import teams from './teams';

const app = express();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: true}));
// parse application/json
app.use(bodyParser.json({limit: '50mb'}));
// parse multipart-form-data
app.use(multer({
  dest: '/tmp',
  limits: {fileSize: '500'}
}).any());

app.use(cors());
app.use(errorhandler());

if (process.env.NODE_ENV === 'production') {
  // trust proxy in production from local nginx front server
  app.set('trust proxy', 'loopback');
}

app.use('/auth', auth);
app.use(loggedIn);
app.use('/teams', teams);
app.get('/', (req, res) => {
  return res.status(200).send({msg: 'We are up and running. Go and change the world'});
});
// catch all route
app.all('*', (req, res) => {
  res.status(404).send({msg: 'not found'});
});

export default app;
