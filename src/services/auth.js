import createError from 'http-errors';
import bcrypt from 'bcrypt';
import { Session } from '../models/session.model.js';

import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model.js';
import dotenv from 'dotenv';
dotenv.config();

export const registerService = async ({ name, email, password }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) throw createError(409, 'Email in use');
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hashedPassword });
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

export const loginService = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) throw createError(401, 'Invalid credentials');
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw createError(401, 'Invalid credentials');
  // Session and tokens logic will be in controller
  return user;
};

export const removeSessionByUserId = async (userId) => {
  await Session.deleteMany({ userId });
};

export const sendResetEmailService = async (email) => {
  const user = await User.findOne({ email });
  if (!user) throw createError(404, 'User not found!');

  const token = jwt.sign({ email }, process.env.JWT_SECRET, {
    expiresIn: '5m',
  });

  const resetUrl = `${process.env.APP_DOMAIN}/reset-password?token=${token}`;

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: email,
    subject: 'Reset your password',
    html: `<p>To reset your password, click <a href="${resetUrl}">here</a>.</p>`,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (err) {
    throw createError(500, 'Failed to send the email, please try again later.');
  }
};

export const resetPwdService = async (token, newPassword) => {
  let email;
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    email = payload.email;
  } catch (err) {
    throw createError(401, 'Token is expired or invalid.');
  }

  const user = await User.findOne({ email });
  if (!user) throw createError(404, 'User not found!');

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashedPassword;
  await user.save();

  await Session.deleteMany({ userId: user._id });
};
