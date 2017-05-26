import express from 'express';
import {omit, isString} from 'lodash';
import bcrypt from 'bcrypt';

import models from 'app/models';
import {login, logout} from 'app/auth';
import {Validator} from 'app/reducer';
import {isEmail} from 'app/util';

import {
  loggedIn,
  getAuthKeyFromRequest
} from 'app/auth/filters';

const app = express();

async function alreadySignedUp(req, res, next) {
  if (!req.body.email || req.body.email.length === 0) {
    return next();
  }

  const existing = await models.Users.find({where: {email: req.body.email}}).then((user) => {
    return user;
  });
  if(existing) {
    return res.status(409).send({email: 'Email already taken.'});
  } else {
    return next();
  }
}

const signUpValidator = new Validator({
  ['email'](email) {
    return (isEmail(email) && isString(email)) ? null : 'Email is invalid.';
  },
  ['password'](password) {
    if(isString(password) && password.length > 4) {
      return null;
    } else {
      return 'Password should be atleast 5 characters long.';
    }
  },
  ['name'](name) {
    return (isString(name)) ? null : 'name is invalid.';
  }
});

app.post('/signup', alreadySignedUp, async (req, res) => {
  const errors = await signUpValidator.errors(req.body);
  if (errors) {
    return res.status(400).send(errors);
  }
  const {email, password, name} = req.body;
  const user = await models.Users.create({
    email,
    hashed_password: await new Promise((resolve) => bcrypt.hash(password, 10, (_, hash) => resolve(hash))),
    name
  }).then((user) => {
    return user;
  });

  if (user) {
    return res.status(200).send({msg: 'Signup success.', user: omit(user, ['password'])});
  } else {
    return res.status(400).send({msg: 'Signup failed.'});
  }
});

app.post('/login', async (req, res) => {
  const {email, password} = req.body;
  const {success, token, user} = await login(email, password);
  if (success) {
    return res.status(200).send({msg: 'logged in', token, user: omit(user, ['password'])});
  } else {
    return res.status(400).send({email: ['Email password combination is invalid.']});
  }
});

app.post('/logout', loggedIn, async (req, res) => {
  const authKey = getAuthKeyFromRequest(req);

  await logout(authKey);

  return res.send({msg: 'logged out'});
});

export default app;
