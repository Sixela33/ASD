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
    { staffBudget: 1800, projectContact: 'Contact3', projectDate: '2024-01-18', projectDescription: 'Project3', projectClient: 3, profitMargin: 0.18, creatorid: 1 },
    { staffBudget: 3000, projectContact: 'Contact4', projectDate: '2024-01-19', projectDescription: 'Project4', projectClient: 4, profitMargin: 0.25, creatorid: 2 },
    { staffBudget: 2200, projectContact: 'Contact5', projectDate: '2024-01-20', projectDescription: 'Project5', projectClient: 3, profitMargin: 0.2, creatorid: 2 },
    { staffBudget: 2800, projectContact: 'Contact6', projectDate: '2024-01-21', projectDescription: 'Project6', projectClient: 4, profitMargin: 0.18, creatorid: 2 },
    { staffBudget: 3200, projectContact: 'Contact7', projectDate: '2024-01-22', projectDescription: 'Project7', projectClient: 1, profitMargin: 0.22, creatorid: 3 },
    { staffBudget: 2700, projectContact: 'Contact8', projectDate: '2024-01-23', projectDescription: 'Project8', projectClient: 3, profitMargin: 0.17, creatorid: 3 },
    { staffBudget: 2300, projectContact: 'Contact9', projectDate: '2024-01-24', projectDescription: 'Project9', projectClient: 5, profitMargin: 0.15, creatorid: 3 },
    { staffBudget: 3500, projectContact: 'Contact10', projectDate: '2024-01-25', projectDescription: 'Project10', projectClient: 1, profitMargin: 0.2, creatorid: 4 }
];

const flowers = [
    { flowerName: 'Rose', flowerImage: 'rose.jpg', flowerColor: 'Red' },
    { flowerName: 'Tulip', flowerImage: 'tulip.jpg', flowerColor: 'Pink' },
    { flowerName: 'Lily', flowerImage: 'lily.jpg', flowerColor: 'White' },
    { flowerName: 'Sunflower', flowerImage: 'sunflower.jpg', flowerColor: 'Yellow' },
    { flowerName: 'Daisy', flowerImage: 'daisy.jpg', flowerColor: 'Yellow and White' },
    { flowerName: 'Orchid', flowerImage: 'orchid.jpg', flowerColor: 'Purple' },
    { flowerName: 'Carnation', flowerImage: 'carnation.jpg', flowerColor: 'Pink' },
    { flowerName: 'Daffodil', flowerImage: 'daffodil.jpg', flowerColor: 'Yellow' },
    { flowerName: 'Hydrangea', flowerImage: 'hydrangea.jpg', flowerColor: 'Blue' },
    { flowerName: 'Peony', flowerImage: 'peony.jpg', flowerColor: 'Pink' }
];
  
const flowerXArrangement = [
    [{ flowerID: 1, quantity: 4 }, { flowerID: 2, quantity: 2 }],
    [{ flowerID: 3, quantity: 5 }],
    [{ flowerID: 4, quantity: 3 }, { flowerID: 5, quantity: 7 }],
    [{ flowerID: 2, quantity: 3 }, { flowerID: 6, quantity: 4 }, { flowerID: 7, quantity: 2 }],
    [{ flowerID: 1, quantity: 6 }, { flowerID: 5, quantity: 5 }, { flowerID: 8, quantity: 3 }],
    [{ flowerID: 3, quantity: 4 }, { flowerID: 9, quantity: 6 }],
    [{ flowerID: 10, quantity: 8 }]
];

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
        // arrangementID, flowerData
        const populatedArrangements = []
        for (let i = 1; i <= 6; i++) {
            let number = Math.floor(Math.random() * 15)
            while (number in populatedArrangements){
                number = Math.floor(Math.random() * 15)
            }
            await model.populateArrangements(number, flowerXArrangement[Math.floor(Math.random()*flowerXArrangement.length)])           
        }

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