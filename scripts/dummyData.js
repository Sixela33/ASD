import CnxPostgress from '../model/CnxPostgress.js';
import ModelPostgres from '../model/DAO/ModelPostgres.js';
import bcrypt from 'bcrypt';


const arrangements = [
    { arrangementType: 1, arrangementDescription: 'Bridal', clientCost: 100, arrangementQuantity: 5 },
    { arrangementType: 1, arrangementDescription: 'Blue arrangement', clientCost: 150, arrangementQuantity: 3 },
    { arrangementType: 2, arrangementDescription: 'Red for the entrance', clientCost: 120, arrangementQuantity: 4 }
];

const projects = [
    { staffBudget: 0.3, projectContact: 'John Doe', projectDate: '2024-01-16', projectDescription: 'Conference', projectClient: 1, profitMargin: 0.7, creatorid: 1 },
    { staffBudget: 0.3, projectContact: 'Alice Smith', projectDate: '2024-01-17', projectDescription: 'Product Launch', projectClient: 2, profitMargin: 0.7, creatorid: 1 },
    { staffBudget: 0.3, projectContact: 'Bob Johnson', projectDate: '2024-01-18', projectDescription: 'Workshop', projectClient: 3, profitMargin: 0.7, creatorid: 1 },
    { staffBudget: 0.3, projectContact: 'Emma Brown', projectDate: '2024-01-19', projectDescription: 'Trade Show', projectClient: 4, profitMargin: 0.7, creatorid: 1 },
    { staffBudget: 0.3, projectContact: 'Michael Davis', projectDate: '2024-01-20', projectDescription: 'Seminar', projectClient: 3, profitMargin: 0.7, creatorid: 1 },
    { staffBudget: 0.3, projectContact: 'Sarah Wilson', projectDate: '2024-01-21', projectDescription: 'Expo', projectClient: 4, profitMargin: 0.7, creatorid: 1 },
    { staffBudget: 0.3, projectContact: 'William Martinez', projectDate: '2024-01-22', projectDescription: 'Symposium', projectClient: 1, profitMargin: 0.7, creatorid: 1 },
    { staffBudget: 0.3, projectContact: 'Olivia Taylor', projectDate: '2024-01-23', projectDescription: 'Convention', projectClient: 3, profitMargin: 0.7, creatorid: 1 },
    { staffBudget: 0.3, projectContact: 'James Anderson', projectDate: '2024-01-24', projectDescription: 'Training Session', projectClient: 5, profitMargin: 0.7, creatorid: 1 },
    { staffBudget: 0.3, projectContact: 'Sophia White', projectDate: '2024-01-25', projectDescription: 'Hackathon', projectClient: 1, profitMargin: 0.2, creatorid: 1 }
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
    "Ford",
    "Gucci",
    "Tesla",
    "Smart Water",
    "Cocacola",
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
            await model.createProject(staffBudget, projectContact, projectDate, projectDescription, projectClient, profitMargin, creatorid, arrangements, [], false);
        }
    } catch (error) {
        console.error('Error during project creation: \n', error);
    }
};

const populateArangement = async (model) => {
    try {
        const initialValue = 6
        for (let i = initialValue; i <= initialValue + 15 ; i++) {
            // arrangementID, flowerData
            await model.populateArrangement(i, flowerXArrangement[Math.floor(Math.random()*flowerXArrangement.length)])           
        }

    } catch (error) {
        console.error('error during arrangementPopulation: \n', error)

    }
}

const loadVendors = async (model) => {
    try {
        for (let v of vendors) {
            await model.addVender(v)
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
        //await createUsers(model)
        //await createClients(model)
        //await loadArrangementTypes(model)
        await createProjects(model)
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