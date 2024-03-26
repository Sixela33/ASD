import { expect } from "chai"
import supertest from "supertest"
import "dotenv/config"
import faker from "faker"

const request = supertest(process.env.HOST + ':' + process.env.PORT)

describe('Role Routes /api/users/roles', () => {
    let adminToken 

    let existingRoles

    before(async () => {

        const adminCredentials = {
            email: 'aj@gmail.com',
            password: 'QWERQWER',
        }

        const loginResponse = await request.post('/api/users/login').send(adminCredentials)
        
        adminToken = loginResponse.body.accessToken
    })
    
    describe('GET /list/:offset', async () => {
        it("should get all existing roles", async () => {
    
            const response = await request.get('/api/users/roles').set('Authorization', `${adminToken}`)
            
            expect(response.status).to.equal(200)
            response.body.forEach(role => {
                expect(role).to.have.property("rolename")
                expect(role).to.have.property("permissionlevel")
            });
    
            existingRoles = response.body
    
        })

    }) 

    describe('POST /create', () => {
        it("should create a new role", async () => {
            const newRoleData = {
                roleName: faker.name.jobTitle(), 
                roleCode: faker.datatype.number()
            }

            const response = await request.post('/api/users/roles/create').set('Authorization', `${adminToken}`).send(newRoleData)
           
            expect(response.status).to.equal(200)
        })

        it("should return 400 when data is invalid", async () => {
            const newRoleData = { 
                roleCode: 2
            }

            const response = await request.post('/api/users/roles/create').set('Authorization', `${adminToken}`).send(newRoleData)
           
            expect(response.status).to.equal(400)
        })
    })

    describe('PATCH /changePermissions', () => {
        it("should change the users permission", async () => {

            let userwithNewRole = {
                newRoleid: 2, 
                userid: 4
            }

            const response = await request.patch('/api/users/roles/changePermissions').set('Authorization', `${adminToken}`).send(userwithNewRole)

            expect(response.status).to.equal(200)
        })

        it("should return 400 if sent invalid data", async () => {

            let userwithNewRole = {
                newRoleid: 2, 
            }

            const response = await request.patch('/api/users/roles/changePermissions').set('Authorization', `${adminToken}`).send(userwithNewRole)

            expect(response.status).to.equal(400)
        })
    })
})