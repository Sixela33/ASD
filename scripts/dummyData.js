import CnxPostgress from '../model/CnxPostgress.js';
import ModelPostgres from '../model/DAO/ModelPostgres.js';
import bcrypt from 'bcrypt';

const users = [
    { username: 'user1', email: 'user1@example.com', password: 'password1' },
    { username: 'user2', email: 'user2@example.com', password: 'password2' },
    { username: 'user3', email: 'user3@example.com', password: 'password3' }
];

const arrangements = [
    { arrangementType: 1, arrangementDescription: 'Description1', flowerBudget: 100, arrangementQuantity: 5 },
    { arrangementType: 1, arrangementDescription: 'Description2', flowerBudget: 150, arrangementQuantity: 3 },
    { arrangementType: 2, arrangementDescription: 'Description3', flowerBudget: 120, arrangementQuantity: 4 }
];

const projects = [
    { staffBudget: 2000, projectContact: 'Contact1', projectDate: '2024-01-16', projectDescription: 'Project1', projectClient: 1, profitMargin: 0.2, creatorid: 1 },
    { staffBudget: 2500, projectContact: 'Contact2', projectDate: '2024-01-17', projectDescription: 'Project2', projectClient: 2, profitMargin: 0.15, creatorid: 1 },
    { staffBudget: 1800, projectContact: 'Contact3', projectDate: '2024-01-18', projectDescription: 'Project3', projectClient: 3, profitMargin: 0.18, creatorid: 1 }
];

const flowers = [
    { flowerName: 'Rose', flowerImage: 'rose.jpg', flowerColor: 'Red' },
    { flowerName: 'Tulip', flowerImage: 'tulip.jpg', flowerColor: 'Pink' },
    { flowerName: 'Lily', flowerImage: 'lily.jpg', flowerColor: 'White' }
];
  
const flowerXArrangement = [
    {flowerID: 1, quantity:4},
    {flowerID: 2, quantity:2},
]

const vendors = [
    "Associated",
    "GPage",
    "FleuraMetz",
    "Evergreen",
    "Dutch",
    "28th St wholesale",
    "Abraflora",
    "JRose",
    "Tropical Plants & Orchids",
    "Fragrance Plants & Flowers",
    "Foliage Paradise",
    "Foliage Garden and Tony's",
    "Holiday Flowers & Plants",
    "Flowers on Essex",
    "International Garden",
    "Holiday Foliage",
    "Caribbean Cuts",
    "Major",
    "Jamali Floral & Garden",
    "NYFG",
    "Whole Foods"
]

const CLIENTS = [
    "client 1",
    "client 2",
    "client 3",
    "client 4",
    "client 5",
]

const ARRANGEMENT_TYPES = [
    "Petit arrangement",
    "Normal arrangement",
    "Big arrangement"
]

const createUsers = async (model) => {
    try {
        console.log("Creating users");
        for (let user of users) {
            const hashedPassword = await bcrypt.hash(user.password, 10);
            await model.registerUser(user.username, user.email, hashedPassword);
        }
    } catch (error) {
        console.error("Error during user creation: \n", error);
    }
};

const createProjects = async (model) => {
    try {
        console.log('Creating projects');
        for (let project of projects) {
            let {staffBudget, projectContact, projectDate, projectDescription, projectClient, profitMargin, creatorid} = project;
            await model.createProject(staffBudget, projectContact, projectDate, projectDescription, projectClient, profitMargin, creatorid, arrangements);
        }
    } catch (error) {
        console.error('Error during project creation: \n', error);
    }
};

const createFlowers = async (model) => {
    try {
        for (let flower of flowers) {
            let {flowerName, flowerImage, flowerColor} = flower;
            await model.addFlower('', flowerName, flowerColor);
        }
    } catch (error) {
        console.error('Error during flower creation: \n', error);
    }
};

const populateArangement = async (model) => {
    try {
        await model.populateArrangements(1, flowerXArrangement)
        await model.populateArrangements(2, flowerXArrangement)
        await model.populateArrangements(5, flowerXArrangement)

    } catch (error) {
        console.error('error during arrangementPopulation: \n', error)

    }
}

const loadVendors = async (model) => {
    try {
        for (let v in vendors) {
            await model.createVendor(v)
        }
    } catch (error) {
        console.error('error while loading providers: \n', error)
    }
}

const createClients = async (model) => {
    try {
        for (let c of CLIENTS) {
            await model.createClient(c)
        }
    } catch (error) {
        console.error('error while loading clients: \n', error)

    }
}

const loadArrangementTypes = async (model) => {
    try {
        for (let at of ARRANGEMENT_TYPES) {
            await model.loadArrangementType(at)
        }
    } catch (error) {
        console.error('error while loading arrangementTypes: \n', error)

    }
}

const runScript = async() => {
    try {
        await CnxPostgress.connect();
        const model = new ModelPostgres();
        await createUsers(model)
        await createClients(model)
        await loadArrangementTypes(model)
        await createProjects(model)
        await createFlowers(model)
        await populateArangement(model)
        await loadVendors(model)
    } catch (error) {
        console.log(error)
    } finally {
        await CnxPostgress.disconnect();

    }

}

(async () => {
    await runScript();
})();