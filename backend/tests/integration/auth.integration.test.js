import request from 'supertest';
import express from 'express';
import cookieParser from 'cookie-parser';
import bcrypt from 'bcrypt';
import db from '../../config/Database.js';
import { Users } from '../../models/index.js';
import AuthRoute from '../../routes/AuthRoute.js';

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/api/auth', AuthRoute);

describe('Auth API Integration Tests', () => {
    beforeAll(async () => {
        // Sync database
        await db.sync({ force: true });
        
        // Create test user
        const hashedPassword = await bcrypt.hash('password123', 10);
        await Users.create({
            name: 'Test Admin',
            email: 'admin@test.com',
            password: hashedPassword,
            role: 'admin',
            department: 'IT',
            is_active: true
        });

        await Users.create({
            name: 'Inactive User',
            email: 'inactive@test.com',
            password: hashedPassword,
            role: 'employee',
            is_active: false
        });
    });

    afterAll(async () => {
        await db.close();
    });

    describe('POST /api/auth/login', () => {
        it('should login successfully with valid credentials', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'admin@test.com',
                    password: 'password123'
                });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('accessToken');
            expect(response.body.data).toHaveProperty('user');
            expect(response.body.data.user.email).toBe('admin@test.com');
        });

        it('should return 401 for invalid password', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'admin@test.com',
                    password: 'wrongpassword'
                });

            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
        });

        it('should return 401 for non-existent user', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'notfound@test.com',
                    password: 'password123'
                });

            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
        });

        it('should return 401 for inactive user', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'inactive@test.com',
                    password: 'password123'
                });

            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
        });

        it('should return 400 for missing email', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    password: 'password123'
                });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });

        it('should return 400 for missing password', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'admin@test.com'
                });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });
    });

    describe('GET /api/auth/me', () => {
        let accessToken;

        beforeAll(async () => {
            const loginResponse = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'admin@test.com',
                    password: 'password123'
                });

            accessToken = loginResponse.body.data.accessToken;
        });

        it('should return current user info with valid token', async () => {
            const response = await request(app)
                .get('/api/auth/me')
                .set('Authorization', `Bearer ${accessToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.email).toBe('admin@test.com');
        });

        it('should return 401 without token', async () => {
            const response = await request(app)
                .get('/api/auth/me');

            expect(response.status).toBe(401);
        });

        it('should return 401 with invalid token', async () => {
            const response = await request(app)
                .get('/api/auth/me')
                .set('Authorization', 'Bearer invalid-token');

            expect(response.status).toBe(401);
        });
    });

    describe('DELETE /api/auth/logout', () => {
        it('should logout successfully', async () => {
            // First login
            const loginResponse = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'admin@test.com',
                    password: 'password123'
                });

            const refreshToken = loginResponse.headers['set-cookie']
                ?.find(cookie => cookie.startsWith('refreshToken='));

            const response = await request(app)
                .delete('/api/auth/logout')
                .set('Cookie', refreshToken || '');

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });
    });
});
