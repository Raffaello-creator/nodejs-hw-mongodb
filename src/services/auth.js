import createError from 'http-errors';
import bcrypt from 'bcrypt';
import { User } from '../models/user.model.js';
import { Session } from '../models/session.model.js';

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
