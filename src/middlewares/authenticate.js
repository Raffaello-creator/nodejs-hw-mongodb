import jwt from 'jsonwebtoken';
import createError from 'http-errors';
import { User } from '../models/user.model.js';
import { Session } from '../models/session.model.js';

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'access_secret';

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    const [type, token] = authHeader.split(' ');
    if (type !== 'Bearer' || !token) {
      throw createError(401, 'No access token');
    }
    let payload;
    try {
      payload = jwt.verify(token, ACCESS_TOKEN_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        throw createError(401, 'Access token expired');
      }
      throw createError(401, 'Invalid access token');
    }
    const session = await Session.findOne({ accessToken: token });
    if (!session || session.accessTokenValidUntil < new Date()) {
      throw createError(401, 'Access token expired');
    }
    const user = await User.findById(payload.userId);
    if (!user) {
      throw createError(401, 'User not found');
    }
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};
