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
            password: 'QWERQWER1',
        }

        const loginResponse = await request.get('/api/users/oauthlogin').send(adminCredentials)

        refreshToken = loginResponse.headers['set-cookie']

        const refreshResponse = await request.get('/api/users/refresh').set('Cookie', refreshToken)

        adminToken = refreshResponse.body
        
    })

    describe('POST /login', () => {
        it('should log in user with correct credentials', async () => {

            const validUserCredentials = {
                email: 'aj@gmail.com',
                password: 'QWERQWER1',
            }

            const loginResponse = await request.get('/api/users/oauthlogin').send(validUserCredentials)

            const RefreshTOKEN = loginResponse.headers['set-cookie']
    
            const refreshResponse = await request.get('/api/users/refresh').set('Cookie', RefreshTOKEN)

            expect(refreshResponse.body).to.not.be.undefined
            expect(RefreshTOKEN).to.not.be.undefined

        })
    }) 

    describe('GET /all', () => {
        it('should return list of all users', async () => {

            const response = await request.get('/api/users/all'+ '?searchEmail=' + '' + '&offset=' + 0).set('Authorization', `${adminToken}`)

            expect(response.status).to.equal(200)
        })

        it('should return a filtered list of all users', async () => {

            const response = await request.get('/api/users/all'+ '?searchEmail=' + 'a' + '&offset=' + 0).set('Authorization', `${adminToken}`)

            expect(response.status).to.equal(200)
        })

        it('should return break with invalid parameters', async () => {

            const response = await request.get('/api/users/all'+ '?searchEmail=' + '' + '&offset=' + undefined).set('Authorization', `${adminToken}`)

            expect(response.status).to.equal(400)
        })

        it('should fail if not authenticated', async () => {
            const response = await request.get('/api/users/all')
    
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
