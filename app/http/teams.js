import express from 'express';
import {isString} from 'lodash';

import models from 'app/models';
import {Validator} from 'app/reducer';
const app = express();

const validator = new Validator({
  ['name'](name) {
    return !isString(name) && name.length === 0 ? 'Team name is not valid' : null;
  }
});

app.route('/')
  .get(async (req, res) => {
    models.Teams.findAll({
      where: {user_id: req.user.id},
      include: [{
        model: models.Users
      }]
    }).then((teams) => {
      return res.status(200).send({msg: 'User teams', teams});
    });
  })
  .post(async (req, res) => {
    const errors = await validator.errors(req.body);
    if(errors) {
      return res.status(400).send(errors);
    }
    models.Teams.create({
      user_id: req.user.id,
      name: req.body.name
    }).then((team) => {
      return res.status(200).send({msg: 'User teams', team});
    });
  })
;

async function teamExists(req, res, next) {
  const team = await models.Teams.find({
    where: {id: req.params.teamId}
  }).then((team) => {
    return team;
  });
  if(team) {
    req.team = team;
    return next();
  } else {
    return res.status(409).send({msg: 'Team does not exists'});
  }
}

app.route('/:teamId')
  .get(teamExists, async (req, res) => {
    return res.status(200).send({msg: 'Team', team: req.team});
  })
  .put(teamExists, async (req, res) => {
    const errors = await validator.errors(req.body);
    if(errors) {
      return res.status(400).send(errors);
    }
    models.Teams.update({
      name: req.body.name
    }, {
      where: {id: req.team.id}
    }).then(() => {
      return res.status(200).send({msg: 'Team updated'});
    });
  })
;
export default app;
