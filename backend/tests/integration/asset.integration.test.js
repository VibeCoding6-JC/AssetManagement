import request from 'supertest';
import express from 'express';
import cookieParser from 'cookie-parser';
import bcrypt from 'bcrypt';
import db from '../../config/Database.js';
import { Users, Categories, Locations, Vendors, Assets, Transactions } from '../../models/index.js';
import AssetRoute from '../../routes/AssetRoute.js';
import AuthRoute from '../../routes/AuthRoute.js';
import { verifyToken } from '../../middleware/AuthMiddleware.js';

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/api/auth', AuthRoute);
app.use('/api/assets', AssetRoute);

describe('Asset API Integration Tests', () => {
    let accessToken;
    let testCategory;
    let testLocation;
    let testVendor;
    let testAsset;

    beforeAll(async () => {
        // Sync database
        await db.sync({ force: true });
        
        // Create test admin
        const hashedPassword = await bcrypt.hash('password123', 10);
        await Users.create({
            name: 'Test Admin',
            email: 'admin@test.com',
            password: hashedPassword,
            role: 'admin',
            department: 'IT',
            is_active: true
        });

        // Login to get token
        const loginResponse = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'admin@test.com',
                password: 'password123'
            });

        accessToken = loginResponse.body.data.accessToken;

        // Create test category
        testCategory = await Categories.create({
            name: 'Laptop',
            description: 'Portable computers'
        });

        // Create test location
        testLocation = await Locations.create({
            name: 'HQ - Floor 1',
            address: 'Jl. Sudirman No. 1'
        });

        // Create test vendor
        testVendor = await Vendors.create({
            name: 'PT. Lenovo',
            contact_person: 'John Doe',
            email: 'john@lenovo.co.id'
        });
    });

    afterAll(async () => {
        await db.close();
    });

    describe('POST /api/assets', () => {
        it('should create a new asset', async () => {
            const response = await request(app)
                .post('/api/assets')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    name: 'ThinkPad X1 Carbon',
                    asset_tag: 'AST-001',
                    serial_number: 'SN123456789',
                    category_id: testCategory.id,
                    location_id: testLocation.id,
                    vendor_id: testVendor.id,
                    purchase_date: '2024-01-15',
                    purchase_price: 25000000,
                    warranty_expiry: '2027-01-15',
                    condition: 'new'
                });

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('uuid');
            expect(response.body.data.name).toBe('ThinkPad X1 Carbon');

            testAsset = response.body.data;
        });

        it('should return 400 for duplicate asset_tag', async () => {
            const response = await request(app)
                .post('/api/assets')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    name: 'Another Laptop',
                    asset_tag: 'AST-001', // Duplicate
                    serial_number: 'SN987654321',
                    category_id: testCategory.id,
                    location_id: testLocation.id,
                    purchase_date: '2024-01-15',
                    purchase_price: 20000000
                });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });

        it('should return 400 for missing required fields', async () => {
            const response = await request(app)
                .post('/api/assets')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    name: 'Incomplete Asset'
                });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });

        it('should return 401 without authentication', async () => {
            const response = await request(app)
                .post('/api/assets')
                .send({
                    name: 'Unauthorized Asset'
                });

            expect(response.status).toBe(401);
        });
    });

    describe('GET /api/assets', () => {
        it('should return paginated assets', async () => {
            const response = await request(app)
                .get('/api/assets')
                .set('Authorization', `Bearer ${accessToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('assets');
            expect(response.body.data).toHaveProperty('pagination');
            expect(Array.isArray(response.body.data.assets)).toBe(true);
        });

        it('should filter assets by status', async () => {
            const response = await request(app)
                .get('/api/assets?status=available')
                .set('Authorization', `Bearer ${accessToken}`);

            expect(response.status).toBe(200);
            response.body.data.assets.forEach(asset => {
                expect(asset.status).toBe('available');
            });
        });

        it('should search assets by name', async () => {
            const response = await request(app)
                .get('/api/assets?search=ThinkPad')
                .set('Authorization', `Bearer ${accessToken}`);

            expect(response.status).toBe(200);
            expect(response.body.data.assets.length).toBeGreaterThan(0);
        });
    });

    describe('GET /api/assets/:id', () => {
        it('should return asset by UUID', async () => {
            const response = await request(app)
                .get(`/api/assets/${testAsset.uuid}`)
                .set('Authorization', `Bearer ${accessToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.uuid).toBe(testAsset.uuid);
        });

        it('should return 404 for non-existent asset', async () => {
            const response = await request(app)
                .get('/api/assets/non-existent-uuid')
                .set('Authorization', `Bearer ${accessToken}`);

            expect(response.status).toBe(404);
        });
    });

    describe('PUT /api/assets/:id', () => {
        it('should update asset successfully', async () => {
            const response = await request(app)
                .put(`/api/assets/${testAsset.uuid}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    name: 'Updated ThinkPad X1',
                    notes: 'Updated notes'
                });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.name).toBe('Updated ThinkPad X1');
        });

        it('should return 404 for non-existent asset', async () => {
            const response = await request(app)
                .put('/api/assets/non-existent-uuid')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({ name: 'Updated' });

            expect(response.status).toBe(404);
        });
    });

    describe('GET /api/assets/:id/history', () => {
        it('should return asset transaction history', async () => {
            const response = await request(app)
                .get(`/api/assets/${testAsset.uuid}/history`)
                .set('Authorization', `Bearer ${accessToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data)).toBe(true);
        });
    });

    describe('DELETE /api/assets/:id', () => {
        it('should delete available asset', async () => {
            // Create an asset to delete
            const createResponse = await request(app)
                .post('/api/assets')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    name: 'Asset to Delete',
                    asset_tag: 'AST-DELETE',
                    serial_number: 'SNDELETE123',
                    category_id: testCategory.id,
                    location_id: testLocation.id,
                    purchase_date: '2024-01-15',
                    purchase_price: 10000000
                });

            const assetToDelete = createResponse.body.data;

            const response = await request(app)
                .delete(`/api/assets/${assetToDelete.uuid}`)
                .set('Authorization', `Bearer ${accessToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });
    });
});
