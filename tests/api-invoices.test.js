import { expect } from "chai"
import supertest from "supertest"
import "dotenv/config"
import { invoiceDataGenerator, invoiceFlowerDataGenerator } from "./generators/InvoiceGenerator.js"

const request = supertest(process.env.HOST + ':' + process.env.PORT)

const invoiceFileLoc = './SavedFiles/InvoiceFiles/2024-03-13/Peony(0).png'

describe('Invoice Routes /api/invoices', () => {
    let adminToken 

    before(async () => {

        const adminCredentials = {
            email: 'aj@gmail.com',
            password: 'QWERQWER',
        }

        const loginResponse = await request.post('/api/users/login').send(adminCredentials)

        adminToken = loginResponse.body.accessToken
    })

    describe('POST /incomplete', () => {
        it('should load incomplete invoice data', async () => {
            let invoiceData = invoiceDataGenerator()
            invoiceData = JSON.stringify(invoiceData)

            const response = await request.post('/api/invoices/incomplete').set('Authorization', `${adminToken}`).attach('invoiceFile', invoiceFileLoc).field("invoiceData", invoiceData)

            expect(response.status).to.equal(200)
        })

        it('should return 400 with invalid file', async () => {
            let invoiceData = invoiceDataGenerator()
            invoiceData = JSON.stringify(invoiceData)

            const response = await request.post('/api/invoices/incomplete').set('Authorization', `${adminToken}`).field("invoiceData", invoiceData)

            expect(response.status).to.equal(400)
        })

        it('should return 400 with invalid data', async () => {
            let invoiceData = invoiceDataGenerator()
            invoiceData.vendor = "aaaa"
            invoiceData = JSON.stringify(invoiceData)

            const response = await request.post('/api/invoices/incomplete').set('Authorization', `${adminToken}`).attach('invoiceFile', invoiceFileLoc).field("invoiceData", invoiceData)

            expect(response.status).to.equal(400)
        })
    })

    describe('POST /', () => {
        it('should load invoice data', async () => {
            let invoiceData = invoiceDataGenerator()
            
            let invoiceFlowerData = []
            for (let i =1; i<4; i++) {
                invoiceFlowerData.push(invoiceFlowerDataGenerator(i, 2))
            }

            invoiceData = JSON.stringify(invoiceData)
            invoiceFlowerData = JSON.stringify(invoiceFlowerData)

            const response = await request.post('/api/invoices').set('Authorization', `${adminToken}`)
            .attach('invoiceFile', invoiceFileLoc)
            .field("invoiceData", invoiceData).field('InvoiceFlowerData', invoiceFlowerData)

            expect(response.status).to.equal(200)
        })

        it('should return 400 with invalid file', async () => {
            let invoiceData = invoiceDataGenerator()

            let invoiceFlowerData = []
            for (let i =0; i<4; i++) {
                invoiceFlowerData.push(invoiceFlowerDataGenerator(i, 2))
            }

            invoiceData = JSON.stringify(invoiceData)
            invoiceFlowerData = JSON.stringify(invoiceFlowerData)

            const response = await request.post('/api/invoices/incomplete').set('Authorization', `${adminToken}`) 
            .field("invoiceData", invoiceData).field('InvoiceFlowerData', invoiceFlowerData)


            expect(response.status).to.equal(400)
        })

        it('should return 400 with invalid invoice data', async () => {
            let invoiceData = invoiceDataGenerator()
            invoiceData.vendor = "aaaa"

            let invoiceFlowerData = []
            for (let i =0; i<4; i++) {
                invoiceFlowerData.push(invoiceFlowerDataGenerator(i, 2))
            }

            invoiceData = JSON.stringify(invoiceData)
            invoiceFlowerData = JSON.stringify(invoiceFlowerData)

            const response = await request.post('/api/invoices/').set('Authorization', `${adminToken}`)
            .attach('invoiceFile', invoiceFileLoc)
            .field("invoiceData", invoiceData).field('InvoiceFlowerData', invoiceFlowerData)

            expect(response.status).to.equal(400)
        })

        it('should return 500 with invalid flower data (repeated flower id in invoice/project)', async () => {
            let invoiceData = invoiceDataGenerator()

            let invoiceFlowerData = []
            for (let i =0; i<4; i++) {
                invoiceFlowerData.push(invoiceFlowerDataGenerator(3, 2))
            }

            invoiceData = JSON.stringify(invoiceData)
            invoiceFlowerData = JSON.stringify(invoiceFlowerData)

            const response = await request.post('/api/invoices').set('Authorization', `${adminToken}`)
            .attach('invoiceFile', invoiceFileLoc)
            .field("invoiceData", invoiceData).field('InvoiceFlowerData', invoiceFlowerData)

            expect(response.status).to.equal(400)
        })

        it('should return 400 with invalid flower data (projectid)', async () => {
            let invoiceData = invoiceDataGenerator()

            let invoiceFlowerData = []
            for (let i =0; i<4; i++) {
                invoiceFlowerData.push(invoiceFlowerDataGenerator(i, 'b'))
            }

            invoiceData = JSON.stringify(invoiceData)
            invoiceFlowerData = JSON.stringify(invoiceFlowerData)

            const response = await request.post('/api/invoices/').set('Authorization', `${adminToken}`)
            .attach('invoiceFile', invoiceFileLoc)
            .field("invoiceData", invoiceData).field('InvoiceFlowerData', invoiceFlowerData)

            expect(response.status).to.equal(400)
        })
    })

    describe('GET /invoices/:offset', () => {
        it('should return a list of inovoices', async () => {

            const response = await request.get('/api/invoices/invoices/' + 0).set('Authorization', `${adminToken}`)

            expect(response.status).to.equal(200)
            
            expect(response.body[0]).to.not.be.undefined
            const data = response.body[0]
            expect(data).to.have.property('invoiceid')
            expect(data).to.have.property('vendorname')
            expect(data).to.have.property('invoiceamount')
            expect(data).to.have.property('invoicenumber')
            expect(data).to.have.property('invoicedate')
            expect(data).to.have.property('hastransaction')
        })

        it('should return 400 with invalid offset', async () => {

            const response = await request.get('/api/invoices/invoices/' + 0.3).set('Authorization', `${adminToken}`)

            expect(response.status).to.equal(400)
        })
        
    })

    describe('GET /providedProjects/:id', () => {
        it('should return a list of projects proided by this invoice', async () => {
            const response = await request.get('/api/invoices/providedProjects/' + 1).set('Authorization', `${adminToken}`)

            expect(response.status).to.equal(200)

            expect(response.body).to.have.property("projects")
            expect(response.body).to.have.property("flowers")
            expect(response.body).to.have.property("invoiceData")
            expect(response.body).to.have.property("bankTransactions")

        })

        it('should return 400 with invalid id', async () => {
            const response = await request.get('/api/invoices/providedProjects/' + 0.5).set('Authorization', `${adminToken}`)

            expect(response.status).to.equal(400)


        })
    })

    describe('GET /invoiceData/:id', () => {
        it('should return the data for its invoice', async () => {
            const response = await request.get('/api/invoices/invoiceData/' + 1).set('Authorization', `${adminToken}`)

            expect(response.status).to.equal(200)

            expect(response.body).to.have.property('projects')
            expect(response.body).to.have.property('flowers')
            expect(response.body).to.have.property('invoiceData')
        })

        it('should return 400 with invalid id', async () => {
            const response = await request.get('/api/invoices/invoiceData/'+ undefined).set('Authorization', `${adminToken}`)

            expect(response.status).to.equal(400)

        })
    })



})