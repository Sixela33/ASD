import CnxPostgress from '../model/CnxPostgress.js';
import ModelPostgres from '../model/DAO/ModelPostgres.js';
import faker from 'faker';

const extrasGenerator = () => ({
    description: faker.commerce.department(), 
    clientcost: faker.datatype.float({min: 0, max:1000})
})

const arrangementGenerator = () => ({
    arrangementType: faker.datatype.number({min: 1, max:3}),
    arrangementDescription: faker.commerce.department(),
    clientCost: faker.datatype.number({min:0, max:5000}),
    arrangementQuantity: faker.datatype.number({min:1, max: 100})
})

const projectGenerator = () => [{
    staffBudget: 0.3,
    projectContact: faker.commerce.department(),
    projectDate: faker.date.between('2024-01-01T00:00:00.000Z', '2024-12-31T00:00:00.000Z'),
    projectDescription: faker.commerce.department(),
    projectClient: faker.datatype.number({ min: 1, max: 5 }),
    profitMargin: 0.7,
    creatorid: 1
}]

const projects = [
    { 
    staffBudget: 0.3, 
    projectContact: 'John Doe', 
    projectDate: '2024-01-16', 
    projectDescription: 'Conference', 
    projectClient: 1, 
    profitMargin: 0.7, 
    creatorid: 1 
    },
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


const createProjects = async (model) => {
    try {
        console.log('Creating projects');
        for (let i = 0; i <= 20 ; i++) {
            
            let {staffBudget, projectContact, projectDate, projectDescription, projectClient, profitMargin, creatorid} = projectGenerator()[0];
    
            let extrasArray = []
            let arrangementsArray = []

            for (let i = 0; i <= Math.round(Math.random()) * 10 ; i++) {
                extrasArray.push(extrasGenerator())
            }

            for (let i = 0; i <= Math.round(Math.random()) * 10 ; i++) {
                arrangementsArray.push(arrangementGenerator())
            }
        
            await model.createProject(staffBudget, projectContact, projectDate, projectDescription, projectClient, profitMargin, creatorid, arrangementsArray, extrasArray, false);
        }
    } catch (error) {
        console.error('Error during project creation: \n', error);
    }
};

const populateArangement = async (model) => {
    try {
        const initialValue = 3
        for (let i = initialValue; i <= initialValue + 15 ; i++) {
            await model.populateArrangement(i, flowerXArrangement[Math.floor(Math.random()*flowerXArrangement.length)])           
        }

    } catch (error) {
        console.error('error during arrangementPopulation: \n', error)

    }
}


const runScript = async() => {
    try {
        await CnxPostgress.connect();
        const model = new ModelPostgres();
        await createProjects(model)
        await populateArangement(model)
    } catch (error) {
        console.log(error)
    } finally {
        await CnxPostgress.disconnect();

    }

}

(async () => {
    await runScript();
})();