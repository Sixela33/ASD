import { expect } from "chai"
import supertest from "supertest"
import "dotenv/config"

const request = supertest(process.env.HOST + ':' + process.env.PORT)

describe('Vendor Routes /api/flowers', () => {
    let adminToken 

    before(async () => {

        const adminCredentials = {
            email: 'aj@gmail.com',
            password: 'QWERQWER',
        }

        const loginResponse = await request.post('/api/users/login').send(adminCredentials)

        adminToken = loginResponse.body.accessToken
    })

})