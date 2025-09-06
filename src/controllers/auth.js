import createError from 'http-errors';
import {
  registerService,
  loginService,
  removeSessionByUserId,
} from '../services/auth.js';
import { Session } from '../models/session.model.js';
import { generateTokens } from '../utils/tokenUtils.js';

import { sendResetEmailService } from '../services/auth.js';

import { resetPwdService } from '../services/auth.js';

export const registerController = async (req, res, next) => {
  const user = await registerService(req.body);
  res.status(201).json({
    status: 201,
    message: 'Successfully registered a user!',
    data: user,
  });
};

export const loginController = async (req, res, next) => {
  const user = await loginService(req.body);
  await removeSessionByUserId(user._id);
  const {
    accessToken,
    refreshToken,
    accessTokenValidUntil,
    refreshTokenValidUntil,
  } = generateTokens(user._id);
  await Session.create({
    userId: user._id,
    accessToken,
    refreshToken,
    accessTokenValidUntil,
    refreshTokenValidUntil,
  });
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
  res.status(200).json({
    status: 200,
    message: 'Successfully logged in an user!',
    data: { accessToken },
  });
};

export const sendResetEmailController = async (req, res, next) => {
  await sendResetEmailService(req.body.email);
  res.status(200).json({
    status: 200,
    message: 'Reset password email has been successfully sent.',
    data: {},
  });
};

export const resetPwdController = async (req, res, next) => {
  await resetPwdService(req.body.token, req.body.password);
  res.status(200).json({
    status: 200,
    message: 'Password has been successfully reset.',
    data: {},
  });
};

export const refreshController = async (req, res, next) => {
  const { refreshToken } = req.cookies;
  if (!refreshToken) throw createError(401, 'No refresh token');
  const session = await Session.findOne({ refreshToken });
  if (!session) throw createError(401, 'Invalid session');
  if (session.refreshTokenValidUntil < new Date()) {
    await Session.deleteOne({ _id: session._id });
    throw createError(401, 'Refresh token expired');
  }
  await Session.deleteOne({ _id: session._id });
  const {
    accessToken,
    refreshToken: newRefreshToken,
    accessTokenValidUntil,
    refreshTokenValidUntil,
  } = generateTokens(session.userId);
  await Session.create({
    userId: session.userId,
    accessToken,
    refreshToken: newRefreshToken,
    accessTokenValidUntil,
    refreshTokenValidUntil,
  });
  res.cookie('refreshToken', newRefreshToken, {
    httpOnly: true,
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
  res.status(200).json({
    status: 200,
    message: 'Successfully refreshed a session!',
    data: { accessToken },
  });
};

export const logoutController = async (req, res, next) => {
  const { refreshToken } = req.cookies;
  if (refreshToken) {
    await Session.deleteOne({ refreshToken });
  }
  res.clearCookie('refreshToken');
  res.status(204).send();
};
