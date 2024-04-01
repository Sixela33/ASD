import { expect } from "chai"
import supertest from "supertest"
import "dotenv/config"

const request = supertest(process.env.HOST + ':' + process.env.PORT)
const flowerImagesDir = './FilesToLoad/FlowerImages/Blue/Muscari.png'


describe('Flower Routes /api/flowers', () => {
    let adminToken 

    const flowerIDToGet = 3
    let flowerData

    before(async () => {

        const adminCredentials = {
            email: 'aj@gmail.com',
            password: 'QWERQWER1',
        }

        const loginResponse = await request.post('/api/users/login').send(adminCredentials)

        adminToken = loginResponse.body.accessToken
    })

    describe('POST /', () => {
        it("should load a new flower", async () => {

            const response = await request.post('/api/flowers').set('Authorization', `${adminToken}`)
                .attach('flower', flowerImagesDir).field({'name': "Muscari"}).field({'color': "Blue"});
            
            
            expect(response.status).to.equal(200)

        })

        it("should not break if no image was provided", async () => {
            const response = await request.post('/api/flowers').set('Authorization', `${adminToken}`)
                .field({'name': "Muscari"}).field({'color': "Blue"});
            
            
            expect(response.status).to.equal(200)
        })

        it("should fail if no name was provided", async () => {

            const response = await request.post('/api/flowers').set('Authorization', `${adminToken}`)
                .attach('flower', flowerImagesDir).field({'color': "Blue"});
            
            
            expect(response.status).to.equal(400)
        })
    })

    describe("GET /single/:id",  () => {

        it("should get a single flower correctly", async () => {
            
            const response = await request.get('/api/flowers/single/' + flowerIDToGet).set('Authorization', `${adminToken}`)

            expect(response.status).to.equal(200)
            expect(response.body).to.have.property('flowerData')
            expect(response.body).to.have.property('flowerPrices')

            const flower = response.body.flowerData[0]
            expect(flower).to.have.property('flowerid')
            expect(flower).to.have.property('flowername')
            expect(flower).to.have.property('flowerimage')
            expect(flower).to.have.property('flowercolor')
            expect(flower.flowerid).to.equal(flowerIDToGet)

            flowerData = flower
        })

        it("should return 400 if no id was provided", async () => {
            const response = await request.get('/api/flowers/single/' + undefined).set('Authorization', `${adminToken}`)

            expect(response.status).to.equal(400)
        })
    })

    describe('PATCH /edit', () => {
        it("should edit flower correctly", async () => {

            const editFloweObject = {
                id: flowerIDToGet,
                name: "pepeFlower",
                color: flowerData.flowercolor,
                prevFlowerPath: flowerData.flowerimage
            }
            
            const response = await request.patch('/api/flowers/edit').set('Authorization', `${adminToken}`).send(editFloweObject)

            expect(response.status).to.equal(200)

        })

        it("should return 400 if the id is missing", async () => {
            const editFloweObject = {
                name: "pepeFlower",
                color: flowerData.flowercolor,
                prevFlowerPath: flowerData.flowerimage
            }
            
            const response = await request.patch('/api/flowers/edit').set('Authorization', `${adminToken}`).send(editFloweObject)

            expect(response.status).to.equal(400)
        })
    })

    describe('GET /many/:offset/:query?', () => { 
        it("should get 25 flowers", async () => {

            const response = await request.get('/api/flowers/many/0/').set('Authorization', `${adminToken}`)

            expect(response.status).to.equal(200)
            expect(response.body).to.be.an('array')
            response.body.forEach(flower => {
                expect(flower).to.have.property("flowerid")
                expect(flower).to.have.property("flowername")
                expect(flower).to.have.property("flowerimage")
                expect(flower).to.have.property("flowercolor")
                expect(flower).to.have.property("unitprice")
            });
        })

        it("should get flowers based on query", async () => {
            const response = await request.get('/api/flowers/many/0/a').set('Authorization', `${adminToken}`)

            expect(response.status).to.equal(200)
            expect(response.body).to.be.an('array')
            response.body.forEach(flower => {
                expect(flower).to.have.property("flowerid")
                expect(flower).to.have.property("flowername")
                expect(flower).to.have.property("flowerimage")
                expect(flower).to.have.property("flowercolor")
                expect(flower).to.have.property("unitprice")
            });
        })
     })

})