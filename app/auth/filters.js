import {check} from './index';

export async function loggedIn(req, res, next) {
  const authKey = getAuthKeyFromRequest(req);
  const user = await check(authKey);
  if (user !== null) {
    req.user = user;
    req.authKey = authKey;
    next();
  } else {
    res.status(401).send({msg: 'Unauthorized'});
  }
}

export async function loggedOut(req, res, next) {
  const authKey = getAuthKeyFromRequest(req);
  const user = await check(authKey);

  if (user !== null) {
    res.status(400).send({msg: 'already logged in'});
  } else {
    next();
  }
}

export function getAuthKeyFromRequest(req) {
  return req.header('auth-token');
}
