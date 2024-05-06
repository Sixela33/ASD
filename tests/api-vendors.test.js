import { expect } from "chai"
import supertest from "supertest"
import "dotenv/config"
import faker from "faker"

const request = supertest(process.env.HOST + ':' + process.env.PORT)

describe('Vendor Routes /api/vendors', () => {
    let adminToken 

    before(async () => {

        const adminCredentials = {
            email: 'aj@gmail.com',
            password: 'QWERQWER1',
        }

        const loginResponse = await request.get('/api/users/oauthlogin').send(adminCredentials)

        const refreshToken = loginResponse.headers['set-cookie']

        const refreshResponse = await request.get('/api/users/refresh').set('Cookie', refreshToken)

        adminToken = refreshResponse.body
        
    })

    /*
        this.router.get('/', this.controller.getVendors)
        this.router.post('/', this.controller.addVendor)
        this.router.patch('/edit', this.controller.editVendor)

    */
   describe('GET /', () => {
        it('should returl a list of all vendors', async () => {
            const response = await request.get('/api/vendors').set('Authorization', `${adminToken}`)

            expect(response.status).to.equal(200)
            expect(response.body).to.be.an('array')

            response.body.forEach(vendor => {
                expect(vendor).to.have.property('vendorid')
                expect(vendor).to.have.property('vendorname')
            });
            
        })
    })

    describe('POST /', () => {
        it('should add a new vendor', async () => {
            const vendorname = faker.finance.accountName()

            const response = await request.post('/api/vendors').set('Authorization', `${adminToken}`).send({vendorname})

            expect(response.status).to.equal(200)

        })

        it('should return 400 when sending invalid data', async () => {
            const vendorname = ''

            const response = await request.post('/api/vendors').set('Authorization', `${adminToken}`).send(vendorname)

            expect(response.status).to.equal(400)

        })
    })

    // ACTUIVATE DEACTIVATE VENDOR MISSING

})