import Joi from 'joi';
import { Op } from 'sequelize';

import models from '../../models';
import { makeSha512, createSaltHashPassword } from '../../utils/encryption';


const login_validation = {
  body: Joi.object({
    username: Joi.string()
      .alphanum()
      .min(3)
      .max(30)
      .required(),
    password: Joi.string()
      .min(8)
      .max(30)
      .required()
  })
};
const login = async (req, res, next) => {
  const { error, value } = login_validation.body.validate(req.body);
  if (error) {
    return res.send(400, { error });
  }

  const { username, password } = req.body;
  const user = await models.user.findOne({
    where: { $or: [{ username }, { email: username }] }
  });

  if (user) {
    const hash = makeSha512(password, user.salt);

    if (hash === user.password_hash) {
      const ip_address = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
      const token = await user.createAccessToken(ipAddress);
      return res.send(200, token.toJSON());
    }
  }
  
  res.send(400, { error: 'Kullanıcı bulunamadı!' });
};

const register_validation = {
  body: Joi.object({
    username: Joi.string()
      .alphanum()
      .min(3)
      .max(30)
      .required(),
    password: Joi.string()
      .min(8)
      .max(30)
      .required(),
    email: Joi.string()
      .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }),
    name: Joi.string().min(5).max(30).required()
  })
};
const register = async (req, res, next) => {
  const { error, value } = register_validation.body.validate(req.body);
  if (error) {
    return res.send(400, { error });
  }

  const { username, password, email, name } = req.body;
  let user = await models.user.findOne({
    where: { [Op.or]: { username: username.trim(), email: email.trim() } }
  });
  console.log('3')

  if (user) {
    return res.send(400, { error: 'E-posta adresi veya kullanıcı adı kullanılıyor!' });
  }
  console.log('4')

  const {
    salt: password_salt,
    hash: password_hash
  } = createSaltHashPassword(password);
  const ip_address = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  console.log('5')
  
  user = await models.user.create({
    username,
    email,
    name,
    password_salt,
    password_hash
  });
  console.log('6')
  const token = await user.createAccessToken(ip_address);
  console.log('7')

  res.send(201, { user: user.toJSON(), token: token.toJSON() });
};

const me = (req, res, next) => {
  console.log('???');
  res.send(200, req.user);
}


export default {
  prefix: '/authentications',
  inject: (router) => {
    router.get('/me', me);
    router.post('/register', register);
    router.post('/register', register);
  }
};
