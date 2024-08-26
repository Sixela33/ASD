import axios from "axios";
import fs from "fs";
import path from "path";
import csv from "csv-parser";

const flowerDataLocation = './scripts/flowerData'
const flowerDataCSV = 'dataCSV.csv'
const flowerImagesFolder = 'FlowerImages'
let allSeasons = []

const BASE_URL = 'http://localhost:8080'

const axiosInstance = axios.create({
    baseURL: BASE_URL,
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true
});

const imageAxiosInstance = axios.create({
    baseURL: BASE_URL,
    headers: { 'Content-Type': 'multipart/form-data' },
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
    imageAxiosInstance.defaults.headers.common['Authorization'] = accessToken;
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
                if(data.season === 'All') {
                    data.seasons = allSeasons.map(s => s.seasonname) // Assuming allSeasons is an array of objects with seasonname
                } else {
                    data.seasons = data.season.split('-')
                }

                data.color = data.color.split('-')

                data.price = data.price.replace('$', '')
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
        formData.append('initialPrice', flower.price) 
        formData.append('clientName', flower.clientName) 

        for (const color of flower.color) {
            try {
                await axiosInstance.post('/api/flowers/colors', { 'colorName': color })
            } catch (error) {
                if (error.response.status == 500){
                    console.log(`Error con el color ${color}: `, error.response.data)
                }
            }
            let responseGetColor = await axiosInstance.get('/api/flowers/colors/colorid/' + color)
            formData.append('colors[]', responseGetColor.data.colorid) // Changed .body to .data
        }

        for (const season of flower.seasons) {
            const tempSeason = allSeasons.find(item => item.seasonname === season)
            if (tempSeason) {
                formData.append('seasons[]', tempSeason.seasonsid)
            }
        }        

        const imagePath = path.join(flowerDataLocation, flowerImagesFolder, flower.imageName);
        if (fs.existsSync(imagePath)) {
            
            formData.append('flower', fs.createReadStream(imagePath));
        } else {
            console.warn(`Image not found for ${flower.id}: ${flower.imageName}`);
        }

        try {            
            await imageAxiosInstance.post('/api/flowers', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            //console.log(`Uploaded data for ${flower.name}`);
        } catch (error) {
            console.error(`Error uploading data for ${flower.internalName}:`, error.message);
        }
    }
}

async function main() {
    try {
        await login();
        await populateSeasons()
        const flowerData = await readCSV();
        await uploadFlowerData(flowerData);
        console.log('All flower data uploaded successfully');
    } catch (error) {
        console.error('An error occurred:', error.message);
    }
}

main()