import { expect } from "chai";
import supertest from "supertest";
import "dotenv/config";
import userGenerator from "./generators/userGenerator"; 

const request = supertest(process.env.HOST + ':' + process.env.PORT)

describe('[User Tests]', () => {
    describe('Try to register a user without permissions', async () => {
        const userToRegister = userGenerator.userRegister()
        const response = await request.post('/api/users/register').send(userToRegister)
        console.log(response)
        //expect(response)
    })
})