import { expect } from "chai"
import supertest from "supertest"
import "dotenv/config"
import faker from "faker"

const request = supertest(process.env.HOST + ':' + process.env.PORT)

describe('Client Routes /api/clients', () => {
    let adminToken 

    before(async () => {

        const adminCredentials = {
            email: 'aj@gmail.com',
            password: 'QWERQWER',
        }

        const loginResponse = await request.post('/api/users/login').send(adminCredentials)

        adminToken = loginResponse.body.accessToken
    })

    describe('GET /', () => {
        it('should return a list of clients', async () => {
            const response = await request.get('/api/clients').set('Authorization', `${adminToken}`)

            expect(response.status).to.equal(200)
        })
    })

    describe('POST /', () => {
        it('should create a new client', async () => {

            const newClientName = faker.commerce.department()
            const response = await request.post('/api/clients').set('Authorization', `${adminToken}`).send({clientname: newClientName})

            expect(response.status).to.equal(200)
        })

        it('should return 403 when invalid client name', async () => {

            const newClientName = ''
            const response = await request.post('/api/clients').set('Authorization', `${adminToken}`).send({clientName: newClientName})

            expect(response.status).to.equal(403)
        })
    })
})