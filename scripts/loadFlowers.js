import axios from "axios";
import fs from "fs";
import path from "path";
import csv from "csv-parser";

const flowerDataLocation = './scripts/flowerData'
const flowerDataCSV = 'dataCSV.csv'
const flowerImagesFolder = 'Redy For Website'
let allSeasons = []

const BASE_URL = 'http://localhost:8080'

const axiosInstance = axios.create({
    baseURL: BASE_URL,
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true
});

async function login() {
    const loginObject = { code: 'test' };
    const loginResponse = await axiosInstance.get('/api/users/oauthlogin', { params: loginObject });
    const refreshToken = loginResponse.headers['set-cookie'];

    const refreshResponse = await axiosInstance.get('/api/users/refresh', {
        headers: { 'Cookie': refreshToken }
    });
    const accessToken = refreshResponse.data;

    axiosInstance.defaults.headers.common['Authorization'] = accessToken;
}

async function populateSeasons() {
    const tempallSeasons = await axiosInstance.get('/api/flowers/seasons')
    allSeasons = tempallSeasons.data
}

async function readCSV() {
    const results = [];
    return new Promise((resolve, reject) => {
        fs.createReadStream(path.join(flowerDataLocation, flowerDataCSV))
            .pipe(csv({
                separator: ',',
                headers: ['id', 'internalName', 'clientName', 'season', 'color', 'price', 'imageName']
            }))
            .on('data', (data) => {
                if(data.season == 'All') {
                    data.season = allSeasons
                } else {
                    const tempSeasons = data.season.split('-')
                    const finalseasons = []

                    for (var i = 0; i < tempSeasons.length; i++) {
                        let tempSeason = allSeasons.find(item => item.seasonname == tempSeasons[i])
                        finalseasons.push(tempSeason)
                    }

                    data.seasons = finalseasons
                }

                data.color = data.color.split('-')
                //console.log(data)
                results.push(data) 
            })
            .on('end', () => resolve(results))
            .on('error', (error) => reject(error));
    });
}

async function uploadFlowerData(flowerData) {
    for (const flower of flowerData) {
        const formData = new FormData();
        if(!parseInt(flower.id)) continue

        formData.append('name', flower.internalName)
        formData.append('flower', flower.flower) 
        formData.append('initialPrice', flower.initialPrice) 
        formData.append('clientName', flower.clientName) 

        for (var i = 0; i < flower.color.length; i++) {
            try {
                await axiosInstance.post('/api/flowers/colors', {'colorName': flower.color[i]})
                console.log(`Nuevo color agregado: ${flower.color[i]}`)
            } catch (error) {
                
            }
            let responseGetColor = await axiosInstance.get('/api/flowers/colors/colorid/' + flower.color[i])
            formData.append('colors[]', responseGetColor.data.colorid)
        }

        for (var i = 0; i < flower.season.length; i++) {
            //console.log(flower.season)
            formData.append('seasons[]', flower.season[i].seasonsid)
        }        

        const imagePath = path.join(flowerImagesFolder, flower.imageName);
        if (fs.existsSync(imagePath)) {
            formData.append('flower', fs.createReadStream(imagePath));
        } else {
            console.warn(`Image not found for ID: ${flower.id}: ${flower.imageName}`);
        }

        try {
            console.log(formData)
            /*
            await axiosInstance.post('/api/flowers', formData, {
                headers: { ...formData.getHeaders() }
            });
            */
            //console.log(`Uploaded data for ${flower.name}`);
        } catch (error) {
            console.error(`Error uploading data for ${flower.name}:`, error.message);
        }
    }
}


async function main() {
    await login();
    await populateSeasons()
    const flowerData = await readCSV();
    await uploadFlowerData(flowerData);
    console.log('All flower data uploaded successfully');
   
}

main()