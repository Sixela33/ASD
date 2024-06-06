import { expect } from "chai"
import supertest from "supertest";
import "dotenv/config";
import fs from 'fs'
import path from "path";

const request = supertest(process.env.SCRIPTS_HOST)

let headers = {
    "Authorization": "",
    "headers": { 'Content-Type': 'application/json' },
    "withCredentials": true
}

describe('Loading Flowers', () => {
    describe('POST', () => {
        it('Trying to log in', async () => {
            const loginObject = {code: 'test'}
            let response = await request.get('/api/users/oauthlogin').send(loginObject)
            const refreshToken = response.headers['set-cookie']
            

            response = await request.get('/api/users/refresh').set('Cookie', refreshToken)
            const accessToken = response.body

            expect(accessToken, 'accessToken').to.exist
            headers["Authorization"] = accessToken

            const flowerImagesDir = './FilesToLoad/FlowerImages'
            var folders = fs.readdirSync(flowerImagesDir);
            for (let subfolderName of folders) {
                let tempPath = path.join(flowerImagesDir, subfolderName)
                var images = fs.readdirSync(tempPath);
                
                await request.post('/api/flowers/colors').set(headers).send({'colorName': subfolderName})
                
                for (let flowerImage of images){
                    
                    let responseGetColor = await request.get('/api/flowers/colors/colorid/' + subfolderName).set(headers)
                    
                    let name = flowerImage.split('.')[0]
                    let imageFilePath = path.join(tempPath, flowerImage);
                    
                    const response = await request.post('/api/flowers').set(headers).attach('flower', imageFilePath)
                    .field({'name': name})
                    .field({'colors[]': [responseGetColor.body.colorid]});
                    //expect(response.status).to.equal(200)
                }
            }
        })
    })
})