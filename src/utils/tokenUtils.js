import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'access_secret';
const REFRESH_TOKEN_SECRET =
  process.env.REFRESH_TOKEN_SECRET || 'refresh_secret';

export function generateTokens(userId) {
  const accessTokenValidUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 min
  const refreshTokenValidUntil = new Date(
    Date.now() + 30 * 24 * 60 * 60 * 1000,
  ); // 30 days
  const accessToken = jwt.sign(
    { userId, type: 'access' },
    ACCESS_TOKEN_SECRET,
    { expiresIn: '15m', jwtid: uuidv4() },
  );
  const refreshToken = jwt.sign(
    { userId, type: 'refresh' },
    REFRESH_TOKEN_SECRET,
    { expiresIn: '30d', jwtid: uuidv4() },
  );
  return {
    accessToken,
    refreshToken,
    accessTokenValidUntil,
    refreshTokenValidUntil,
  };
}
