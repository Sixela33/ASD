import { expect } from "chai"
import supertest from "supertest";
import "dotenv/config";
import fs from 'fs'
import path from "path";

const request = supertest(process.env.HOST + ':' + process.env.PORT)

let headers = {
    "Authorization": "",
    "headers": { 'Content-Type': 'application/json' },
    "withCredentials": true
}

describe('Loading Flowers', () => {
    describe('POST', () => {
        it('Trying to log in', async () => {
            const loginObject = {email: 'aj@gmail.com', password: 'QWERQWER1'}
            const response = await request.post('/api/users/login').send(loginObject)

            const accessToken = response.body.accessToken

            expect(accessToken, 'accessToken').to.exist
            headers["Authorization"] = accessToken

            const flowerImagesDir = './FilesToLoad/FlowerImages'
            var folders = fs.readdirSync(flowerImagesDir);
            for (let subfolderName of folders) {
                let tempPath = path.join(flowerImagesDir, subfolderName)
                var images = fs.readdirSync(tempPath);

                for (let flowerImage of images){

                    let name = flowerImage.split('.')[0]
                    let imageFilePath = path.join(tempPath, flowerImage);

                    const response = await request.post('/api/flowers').set(headers).attach('flower', imageFilePath).field({'name': name}).field({'color':subfolderName});
                    expect(response.status).to.equal(200)
                }
            }
        })
    })
})