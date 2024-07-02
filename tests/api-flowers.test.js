import { expect } from "chai";
import supertest from "supertest";
import "dotenv/config";

const request = supertest(process.env.HOST + ':' + process.env.PORT);
const flowerImagesDir = './FilesToLoad/FlowerImages/Blue/Muscari.png';

describe('Flower Routes /api/flowers', () => {
    let adminToken;

    const flowerIDToGet = 3;
    let flowerData;

    const adminCredentials = {
        email: 'aj@gmail.com',
        password: 'QWERQWER1',
    }

    const getAdminToken = async () => {
        const loginResponse = await request.get('/api/users/oauthlogin').send(adminCredentials)
        const refreshToken = loginResponse.headers['set-cookie']
        const refreshResponse = await request.get('/api/users/refresh').set('Cookie', refreshToken)
        return refreshResponse.body
    }

    before(async () => {
        adminToken = await getAdminToken()
    })

    describe('POST /colors', () => {
        it("should add a new flower color", async () => {
            const response = await request.post('/api/flowers/colors')
                .set('Authorization', `${adminToken}`)
                .send({ 'colorName': "bluee" });

            expect(response.status).to.equal(200);
        });

        it("should return 400 if the color name has been used", async () => {
            const response = await request.post('/api/flowers/colors')
                .set('Authorization', `${adminToken}`)
                .send({ 'colorName': "bluee" });

            expect(response.status).to.equal(400);
        });

        it("should return 400 if the color name is missing", async () => {
            const response = await request.post('/api/flowers/colors')
                .set('Authorization', `${adminToken}`)
                .send({});

            expect(response.status).to.equal(400);
        });
    });

    describe('GET /colors', () => {
        it("should get all flower colors", async () => {
            const response = await request.get('/api/flowers/colors')
                .set('Authorization', `${adminToken}`);

            expect(response.status).to.equal(200);
            expect(response.body).to.be.an('array');
        });
    });

    describe('GET /colors/colorid/:name', () => {
        it("should get the color ID of a color name", async () => {
            const response = await request.get('/api/flowers/colors/colorid/bluee')
                .set('Authorization', `${adminToken}`);

            expect(response.status).to.equal(200);
            expect(response.body).to.have.property('colorid');
        });

        it("should return 404 if color does not exist", async () => {
            const response = await request.get('/api/flowers/colors/colorid/nonexistentcolor')
                .set('Authorization', `${adminToken}`);
            


            expect(response.status).to.equal(404);
        });
    });

    describe('PATCH /colors', () => {
        it("should edit flower color", async () => {
            const response = await request.patch('/api/flowers/colors')
                .set('Authorization', `${adminToken}`)
                .send({ colorName: "feet", colorID: 1 });

            expect(response.status).to.equal(200);
        });

        it("should return 400 if color ID is not a number", async () => {
            const response = await request.patch('/api/flowers/colors')
                .set('Authorization', `${adminToken}`)
                .send({ colorName: "feet", colorID: "asdf" });

            expect(response.status).to.equal(400);
        });
    });

    describe('DELETE /colors', () => {
        it("should remove flower color", async () => {
            const response = await request.delete('/api/flowers/colors')
                .set('Authorization', `${adminToken}`)
                .query({ "id": 3 });

            expect(response.status).to.equal(200);
        });

        it("should return 400 if color ID is not a number", async () => {
            const response = await request.delete('/api/flowers/colors')
                .set('Authorization', `${adminToken}`)
                .query({ "id": "asd" });

            expect(response.status).to.equal(400);
        });

        it("should return 200 if color ID does not exist", async () => {
            const response = await request.delete('/api/flowers/colors')
                .set('Authorization', `${adminToken}`)
                .query({ "id": 999999 });

            expect(response.status).to.equal(200);
        });
    });

    describe('POST /', () => {
        it("should load a new flower", async () => {
            const response = await request.post('/api/flowers').set('Authorization', `${adminToken}`)
                .attach('flower', flowerImagesDir)
                .field({ 'name': "Muscari" })
                .field({ 'colors[]': [1] });

            expect(response.status).to.equal(200);
        });

        it("should return 200 if no image was provided", async () => {
            const response = await request.post('/api/flowers').set('Authorization', `${adminToken}`)
                .field({ 'name': "Muscari" })
                .field({ 'colors[]': [1] });

            expect(response.status).to.equal(200);
        });

        it("should return 400 if no name was provided", async () => {
            const response = await request.post('/api/flowers').set('Authorization', `${adminToken}`)
                .attach('flower', flowerImagesDir)
                .field({ 'colors[]': [1] });

            expect(response.status).to.equal(400);
        });
    });

    describe("GET /single/:id", () => {
        it("should get a single flower correctly", async () => {
            const response = await request.get('/api/flowers/single/' + flowerIDToGet).set('Authorization', `${adminToken}`);

            expect(response.status).to.equal(200);
            expect(response.body).to.have.property('flowerData');
            expect(response.body).to.have.property('flowerPrices');

            const flower = response.body.flowerData[0];
            expect(flower).to.have.property('flowerid');
            expect(flower).to.have.property('flowername');
            expect(flower).to.have.property('flowerimage');
            expect(flower).to.have.property('flowercolors');
            expect(flower.flowerid).to.equal(flowerIDToGet);

            flowerData = flower;
        });

        it("should return 400 if no ID was provided", async () => {
            const response = await request.get('/api/flowers/single/' + undefined).set('Authorization', `${adminToken}`);

            expect(response.status).to.equal(400);
        });

        it("should not break if flower ID does not exist", async () => {
            const response = await request.get('/api/flowers/single/999999').set('Authorization', `${adminToken}`);

            expect(response.status).to.equal(200);
        });
    });

    describe('PATCH /edit', () => {
        it("should edit flower correctly", async () => {
            const editFlowerObject = {
                id: flowerIDToGet,
                name: "pepeFlower",
                colors: [1],
                prevFlowerPath: flowerData.flowerimage
            };

            const response = await request.patch('/api/flowers/edit').set('Authorization', `${adminToken}`).send(editFlowerObject);

            expect(response.status).to.equal(200);
        });

        it("should return 400 if the ID is missing", async () => {
            const editFlowerObject = {
                name: "pepeFlower",
                colors: [1],
                prevFlowerPath: flowerData.flowerimage
            };

            const response = await request.patch('/api/flowers/edit').set('Authorization', `${adminToken}`).send(editFlowerObject);

            expect(response.status).to.equal(400);
        });

        it("should not break if flower ID does not exist", async () => {
            const editFlowerObject = {
                id: 999999,
                name: "pepeFlower",
                colors: [1],
                prevFlowerPath: flowerData.flowerimage
            };

            const response = await request.patch('/api/flowers/edit').set('Authorization', `${adminToken}`).send(editFlowerObject);

            expect(response.status).to.equal(404);
        });
    });

    describe('GET /many/:offset/:query?', () => {
        it("should get 25 flowers", async () => {
            const response = await request.get('/api/flowers/many/0/').set('Authorization', `${adminToken}`);

            expect(response.status).to.equal(200);
            expect(response.body).to.be.an('array');
            expect(response.body.length).to.be.at.most(25);

            response.body.forEach(flower => {
                expect(flower).to.have.property("flowerid");
                expect(flower).to.have.property("flowername");
                expect(flower).to.have.property("flowerimage");
                expect(flower).to.have.property("flowercolors");
                expect(flower).to.have.property("unitprice");
            });
        });

        it("should get flowers based on query", async () => {
            const response = await request.get('/api/flowers/many/0/a').set('Authorization', `${adminToken}`);

            expect(response.status).to.equal(200);
            expect(response.body).to.be.an('array');
            response.body.forEach(flower => {
                expect(flower).to.have.property("flowerid");
                expect(flower).to.have.property("flowername");
                expect(flower).to.have.property("flowerimage");
                expect(flower).to.have.property("flowercolors");
                expect(flower).to.have.property("unitprice");
            });
        });

        it("should return empty array if no flowers match query", async () => {
            const response = await request.get('/api/flowers/many/0/zzz').set('Authorization', `${adminToken}`);

            expect(response.status).to.equal(200);
            expect(response.body).to.be.an('array').that.is.empty;
        });
    });
});
