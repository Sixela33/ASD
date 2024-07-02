import { expect } from "chai"
import supertest from "supertest"
import "dotenv/config"

const request = supertest(`${process.env.HOST}:${process.env.PORT}`)

describe('Arrangement Routes /api/users/arrangements', () => {
    let adminToken

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

    describe('GET /types', () => {
        it('should return the list of arrangement types', async () => {
            const response = await request.get('/api/arrangements/types').set('Authorization', adminToken)

            expect(response.status).to.equal(200)
            const body = response.body
            expect(body).to.be.an('array')
            body.forEach(arrangementType => {
                expect(arrangementType).to.have.property("arrangementtypeid")
                expect(arrangementType).to.have.property("typename")
            })
        })
    })

    describe('POST /creation', () => {
        it('should create an arrangement with valid data', async () => {
            const validData = {
                arrangementid: 7, 
                flowers: [
                    { flowerID: 1, quantity: 1 },
                    { flowerID: 2, quantity: 2 },
                ]
            }

            const response = await request.post('/api/arrangements/creation').set('Authorization', adminToken).send(validData)
            expect(response.status).to.equal(200)
        })

        it('should return 400 with invalid flower data', async () => {
            const invalidData = {
                arrangementid: 2, 
                flowers: [
                    { flowerID: 1, quantity: 1 },
                    { flowerID: 5.5, quantity: 2 },
                ]
            }

            const response = await request.post('/api/arrangements/creation').set('Authorization', adminToken).send(invalidData)
            expect(response.status).to.equal(400)
        })

        it('should return 400 with invalid arrangement ID', async () => {
            const invalidData = {
                arrangementid: 2.4, 
                flowers: [
                    { flowerID: 1, quantity: 1 },
                    { flowerID: 5.5, quantity: 2 },
                ]
            }

            const response = await request.post('/api/arrangements/creation').set('Authorization', adminToken).send(invalidData)
            expect(response.status).to.equal(400)
        })
    })

    describe('GET /creation/:id', () => {
        it('should get arrangement data by ID', async () => {
            const arrangementId = 1
            const response = await request.get(`/api/arrangements/creation/${arrangementId}`).set('Authorization', adminToken)

            expect(response.status).to.equal(200)
            const body = response.body
            
            expect(body).to.have.property('arrangementData')
            expect(body).to.have.property('arrangementFlowers')

            const arrangementData = body.arrangementData[0]
            expect(arrangementData).to.not.be.undefined
            expect(arrangementData).to.have.property('arrangementid')
            expect(arrangementData).to.have.property('projectid')
            expect(arrangementData).to.have.property('arrangementtype')
            expect(arrangementData).to.have.property('arrangementdescription')
            expect(arrangementData).to.have.property('clientcost')
            expect(arrangementData).to.have.property('arrangementquantity')
            expect(arrangementData).to.have.property('designerid')
            expect(arrangementData).to.have.property('installationtimes')
            expect(arrangementData).to.have.property('arrangementlocation')
            expect(arrangementData).to.have.property('typename')
            expect(arrangementData).to.have.property('profitmargin')

            expect(body.arrangementFlowers).to.be.an('array')
        })
    })

    describe('PATCH /edit/:id', () => {
        it('should edit arrangement with valid data', async () => {
            const arrangementId = 1
            const newData = {
                arrangementType: 1,
                arrangementDescription: "Updated Description",
                clientCost: 500,
                arrangementQuantity: 1,
            }

            const response = await request.patch(`/api/arrangements/edit/${arrangementId}`).set('Authorization', adminToken).send(newData)
            expect(response.status).to.equal(200)
        })

        it('should return 400 with invalid arrangement type', async () => {
            const arrangementId = 1
            const invalidData = {
                arrangementType: 1.5,
                clientCost: 500,
                arrangementQuantity: 1,
            }

            const response = await request.patch(`/api/arrangements/edit/${arrangementId}`).set('Authorization', adminToken).send(invalidData)
            expect(response.status).to.equal(400)
        })

        it('should return 400 with invalid arrangement ID', async () => {
            const invalidData = {
                arrangementType: 1,
                clientCost: 500,
                arrangementQuantity: 1,
            }

            const response = await request.patch(`/api/arrangements/edit/undefined`).set('Authorization', adminToken).send(invalidData)
            expect(response.status).to.equal(400)
        })
    })

    describe('DELETE /:id', () => {
        it('should delete arrangement with valid ID', async () => {
            const arrangementId = 2
            const response = await request.delete(`/api/arrangements/${arrangementId}`).set('Authorization', adminToken)
            expect(response.status).to.equal(200)
        })

        it('should return 400 with invalid arrangement ID', async () => {
            const response = await request.delete(`/api/arrangements/undefined`).set('Authorization', adminToken)
            expect(response.status).to.equal(400)
        })
    })
})
