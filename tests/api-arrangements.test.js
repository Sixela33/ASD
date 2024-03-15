import { expect } from "chai"
import supertest from "supertest"
import "dotenv/config"

const request = supertest(process.env.HOST + ':' + process.env.PORT)

describe('Arrangement Routes /api/users/arrangements', () => {
    let adminToken 

    before(async () => {

        const adminCredentials = {
            email: 'aj@gmail.com',
            password: 'QWERQWER',
        }

        const loginResponse = await request.post('/api/users/login').send(adminCredentials)
        
        adminToken = loginResponse.body.accessToken
    })

    describe('GET /types', async () => {
        it('should return the list of arrangement types', async () => {
            const response = await request.get('/api/arrangements/types').set('Authorization', `${adminToken}`)

            expect(response.status).to.equal(200)
            const body = response.body

            expect(body).to.be.an('array')
            body.forEach(arrangementType => {
                expect(arrangementType).to.have.property("arrangementtypeid")
                expect(arrangementType).to.have.property("typename")
            });
        })
    })

    describe('GET /creation/:id', async () => {
        it('sholud get arrangement data', async () => {
            const arrangementIdToGet = 5
            const response = await request.get('/api/arrangements/creation/' + arrangementIdToGet).set('Authorization', `${adminToken}`)

            expect(response.status).to.equal(200)
            const body = response.body
            expect(body).to.have.property('arrangementData')
            expect(body).to.have.property('arrangementFlowers')

            expect(body.arrangementData[0]).to.not.be.undefined
            expect(body.arrangementData[0]).to.have.property('arrangementid')
            expect(body.arrangementData[0]).to.have.property('projectid')
            expect(body.arrangementData[0]).to.have.property('arrangementtype')
            expect(body.arrangementData[0]).to.have.property('arrangementdescription')
            expect(body.arrangementData[0]).to.have.property('clientcost')
            expect(body.arrangementData[0]).to.have.property('arrangementquantity')
            expect(body.arrangementData[0]).to.have.property('designerid')
            expect(body.arrangementData[0]).to.have.property('typename')
            expect(body.arrangementData[0]).to.have.property('profitmargin')

            expect(body.arrangementFlowers).to.be.an('array')

        })
    })

    describe('POST /creation', () => {
        it('should populate arrangement', async () => {
            const dataToSend = {
                arrangementid: 7, 
                flowers: [
                    {
                        flowerID: 1,
                        quantity: 1
                    },
                    {
                        flowerID: 2,
                        quantity: 2
                    },
                ]
            }

            const response = await request.post('/api/arrangements/creation').set('Authorization', `${adminToken}`).send(dataToSend)
            
            expect(response.status).to.equal(200)
        })

        it('should return 403 with invalid data', async () => {
            const dataToSend = {
                arrangementid: 2, 
                flowers: [
                    {
                        flowerID: 1,
                        quantity: 1
                    },
                    {
                        flowerID: 5.5,
                        quantity: 2
                    },
                ]
            }
            const response = await request.post('/api/arrangements/creation').set('Authorization', `${adminToken}`).send(dataToSend)
            expect(response.status).to.equal(403)

        })

        it('should return 403 with invalid id', async () => {
            const dataToSend = {
                arrangementid: 2.4, 
                flowers: [
                    {
                        flowerID: 1,
                        quantity: 1
                    },
                    {
                        flowerID: 5.5,
                        quantity: 2
                    },
                ]
            }
            const response = await request.post('/api/arrangements/creation').set('Authorization', `${adminToken}`).send(dataToSend)
            expect(response.status).to.equal(403)
            
        })
    })
    
        describe('PATCH /edit/:id', () => {
            it("should edit arrangement", async () => {
                const arrToEdit = 3
                const newArrangementData = {
                    arrangementType: 1,
                    arrangementDescription: "besto",
                    clientCost: 500,
                    arrangementQuantity: 1,
                }

                const response = await request.patch('/api/arrangements/edit/' + arrToEdit).set('Authorization', `${adminToken}`).send(newArrangementData)
                
                expect(response.status).to.equal(200)
            })

            it('should return 403 with invalid data', async () => {
                const arrToEdit = 3
                const newArrangementData = {
                    arrangementType: 1.5,
                    clientCost: 500,
                    arrangementQuantity: 1,
                }

                const response = await request.patch('/api/arrangements/edit/' + arrToEdit).set('Authorization', `${adminToken}`).send(newArrangementData)
                
                expect(response.status).to.equal(403)
            })

            it('should return 403 with invalid id', async () => {
                const arrToEdit = undefined
                const newArrangementData = {
                    arrangementType: 1.5,
                    clientCost: 500,
                    arrangementQuantity: 1,
                }

                const response = await request.patch('/api/arrangements/edit/' + arrToEdit).set('Authorization', `${adminToken}`).send(newArrangementData)
                
                expect(response.status).to.equal(403)
            })
        })

        describe('DELETE /:id', () => { 
            it('should delete arrangement', async () => {
                const arrToRemove = 2
                const response = await request.delete('/api/arrangements/' + arrToRemove).set('Authorization', `${adminToken}`)
                
                expect(response.status).to.equal(200)
            })

            it('should return 403 with invalid id', async () => {
                const arrToRemove = undefined
                const response = await request.delete('/api/arrangements/' + arrToRemove).set('Authorization', `${adminToken}`)
                
                expect(response.status).to.equal(403)
            })
         })
})
