import { expect } from "chai"
import supertest from "supertest"
import "dotenv/config"
import userGenerator from "./generators/userGenerator.js"

const request = supertest(process.env.HOST + ':' + process.env.PORT)

describe('User Routes /api/users', () => {
    let adminToken 
    let refreshToken

    before(async () => {

        const adminCredentials = {
            email: 'aj@gmail.com',
            password: 'QWERQWER',
        }

        const loginResponse = await request.post('/api/users/login').send(adminCredentials)

        adminToken = loginResponse.body.accessToken
        refreshToken = loginResponse.headers['set-cookie']
    })

    describe('POST /login', () => {
        it('should log in user with correct credentials', async () => {

            const validUserCredentials = {
                email: 'aj@gmail.com',
                password: 'QWERQWER',
            }

            const response = await request.post('/api/users/login').send(validUserCredentials)
            const cookies = response.headers['set-cookie']

            expect(response.body.accessToken).to.not.be.undefined
            expect(cookies).to.not.be.undefined

        })

        it('should not log in user with incorrect credentials', async () => {

            const nonExistentUserCredentias = {
                email: 'asdfas@gmail.com',
                password: 'QWERQWER',
            }

            const response = await request.post('/api/users/login').send(nonExistentUserCredentias)
            expect(response.status).to.equal(401)
        })
    }) 

    describe('GET /all', () => {
        it('should return list of all users', async () => {
            const response = await request.get('/api/users/all').set('Authorization', `${adminToken}`)

            expect(response.status).to.equal(200)
        })

        it('should fail if not authenticated', async () => {
            const response = await request.get('/api/users/all')
    
            expect(response.status).to.equal(403)
        })

    })

    describe('POST /register', () => {
        it('should register a new user', async () => {
        
        let newUser = userGenerator.userRegister()

        const response = await request.post('/api/users/register').send(newUser).set('Authorization', `${adminToken}`)

        expect(response.status).to.equal(201)

        })

        it('should fail if not authenticated', async () => {
            let newUser = userGenerator.userRegister()

            const response = await request.post('/api/users/register').send(newUser)    
            expect(response.status).to.equal(403)
        })
    })

    describe('POST /refresh', () => {
        it('should refresh accessToken', async () => {
            const response = await request.get('/api/users/refresh').set('Cookie', refreshToken)

            expect(response.status).to.equal(200)
            expect(response.body).to.not.be.undefined

        })

        it('should fail if not authenticated', async () => {
            const response = await request.get('/api/users/refresh')

            expect(response.status).to.equal(403)


        })
    })

    describe('POST /logout', () => {
        it('should log out user', async () => {
            const response = await request.get('/api/users/logout').set('Cookie', refreshToken)
            
            expect(response.status).to.equal(204)
            expect(response.header['set-cookie'].jwt).to.be.undefined
        })

        it('should not crash if user is not logged in', async () => {
            const response = await request.get('/api/users/logout')
            
            expect(response.status).to.equal(204)
        })
    })

})
