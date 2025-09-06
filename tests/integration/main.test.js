const request = require('supertest');
const app = require('../../src/server.js');
const mongoose = require('mongoose');
const { User } = require('../../src/models/user.model.js');
const { Session } = require('../../src/models/session.model.js');
const { beforeAll, afterAll, describe, it, expect } = require('@jest/globals');

const testEmail = 'testuser@example.com';
const testPassword = 'Test12345!';

beforeAll(async () => {
  // Підключення до тестової бази
  await mongoose.connect(process.env.MONGODB_URL, {
    user: process.env.MONGODB_USER,
    pass: process.env.MONGODB_PASSWORD,
    dbName: process.env.MONGODB_DB,
  });
  // Створити тестового користувача
  await User.create({
    name: 'Test User',
    email: testEmail,
    password: testPassword,
  });
});

afterAll(async () => {
  await User.deleteMany({ email: testEmail });
  await Session.deleteMany({});
  await mongoose.disconnect();
});

describe('Step 3: /auth/send-reset-email', () => {
  it('should send reset email for existing user', async () => {
    const res = await request(app)
      .post('/auth/send-reset-email')
      .send({ email: testEmail });
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/successfully sent/);
  });

  it('should return 404 for non-existing user', async () => {
    const res = await request(app)
      .post('/auth/send-reset-email')
      .send({ email: 'nouser@example.com' });
    expect(res.statusCode).toBe(404);
    expect(res.body.message).toMatch(/User not found/);
  });
});

describe('Step 4: /auth/reset-pwd', () => {
  let token;
  beforeAll(async () => {
    // Отримати токен через сервіс
    const jwt = require('jsonwebtoken');
    token = jwt.sign({ email: testEmail }, process.env.JWT_SECRET, {
      expiresIn: '5m',
    });
  });

  it('should reset password for valid token', async () => {
    const res = await request(app)
      .post('/auth/reset-pwd')
      .send({ token, password: 'NewPass123!' });
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/successfully reset/);
  });

  it('should return 401 for expired/invalid token', async () => {
    const res = await request(app)
      .post('/auth/reset-pwd')
      .send({ token: 'invalidtoken', password: 'NewPass123!' });
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toMatch(/expired or invalid/);
  });
});

describe('Step 6: /contacts (photo upload)', () => {
  it('should create contact with photo', async () => {
    const res = await request(app)
      .post('/contacts')
      .field('name', 'Photo User')
      .field('phoneNumber', '1234567890')
      .field('contactType', 'personal')
      .attach('photo', __dirname + '/test-assets/test-image.jpg');
    expect(res.statusCode).toBe(201);
    expect(res.body.data.photo).toMatch(/^https?:\/\//);
  });

  it('should update contact with new photo', async () => {
    // Створити контакт
    const createRes = await request(app)
      .post('/contacts')
      .field('name', 'Update Photo')
      .field('phoneNumber', '0987654321')
      .field('contactType', 'work');
    const contactId = createRes.body.data._id;
    // Оновити фото
    const updateRes = await request(app)
      .patch(`/contacts/${contactId}`)
      .attach('photo', __dirname + '/test-assets/test-image.jpg');
    expect(updateRes.statusCode).toBe(200);
    expect(updateRes.body.data.photo).toMatch(/^https?:\/\//);
  });
});
