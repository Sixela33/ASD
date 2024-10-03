import CnxPostgress from '../model/CnxPostgress.js'
import ModelPostgres from '../model/DAO/ModelPostgres.js'
import faker from 'faker'

const extrasGenerator = () => ({
    description: faker.commerce.department(), 
    clientcost: faker.datatype.float({min: 0, max: 1000}),
    ammount: faker.datatype.number({ min: 1, max: 5 })
})

const arrangementGenerator = () => ({
    arrangementType: faker.datatype.number({min: 1, max: 3}),
    arrangementDescription: faker.commerce.department(),
    clientCost: faker.datatype.number({min: 0, max: 5000}),
    arrangementQuantity: faker.datatype.number({min: 1, max: 100})
})

const projectGenerator = () => ({
    staffBudget: 0.3,
    projectContact: faker.commerce.department(),
    projectDate: faker.date.between('2024-01-01', '2024-12-31'),
    projectEndDate: faker.date.between('2025-1-31', '2026-1-31'),
    projectDescription: faker.commerce.department(),
    clientid: 1,
    profitMargin: 0.3,
    creatorid: 1,
    isRecurrent: false
})

const flowerXArrangement = [
    [{ flowerID: 1, quantity: 4 }, { flowerID: 2, quantity: 2 }],
    [{ flowerID: 3, quantity: 5 }],
    [{ flowerID: 4, quantity: 3 }, { flowerID: 5, quantity: 7 }],
    [{ flowerID: 2, quantity: 3 }, { flowerID: 6, quantity: 4 }, { flowerID: 7, quantity: 2 }],
    [{ flowerID: 1, quantity: 6 }, { flowerID: 5, quantity: 5 }, { flowerID: 8, quantity: 3 }],
    [{ flowerID: 3, quantity: 4 }, { flowerID: 9, quantity: 6 }],
    [{ flowerID: 10, quantity: 8 }]
]

const createProjects = async (model) => {
    try {
        console.log('Creating projects')
        for (let i = 0; i < 20; i++) {
            let {
                staffBudget, 
                projectContact, 
                projectDate, 
                projectEndDate, 
                projectDescription, 
                clientid: projectClient, 
                profitMargin, 
                creatorid, 
                isRecurrent
            } = projectGenerator()

            let extrasArray = []
            let arrangementsArray = []

            for (let i = 0; i <= Math.round(Math.random()) * 10 ; i++) {
                extrasArray.push(extrasGenerator())
            }

            for (let i = 0; i <= Math.round(Math.random()) * 10 ; i++) {
                arrangementsArray.push(arrangementGenerator())
            }

            await model.createProject(
                staffBudget, 
                projectContact, 
                projectDate, 
                projectEndDate, 
                projectDescription, 
                projectClient, 
                profitMargin, 
                creatorid, 
                arrangementsArray, 
                extrasArray, 
                isRecurrent
            )
        }
    } catch (error) {
        console.error('Error during project creation: \n', error)
    }
}

const populateArrangement = async (model) => {
    try {
        const initialValue = 3
        for (let i = initialValue; i <= initialValue + 15 ; i++) {
            await model.populateArrangement(i, flowerXArrangement[Math.floor(Math.random()*flowerXArrangement.length)])           
        }
    } catch (error) {
        console.error('Error during arrangement population: \n', error)
    }
}

const loadInvoices = async (model) => {
    try {
        const invoiceData = {
            invoiceAmount: "100", 
            vendor: "1", 
            dueDate: "2024-01-01", 
            invoiceNumber: "asdfasdfasdf"}

        const invoiceFileLocation = "añsdfkja"

        for(let i=0; i<50; i++) {
            await model.addIncompleteInvoice(invoiceData, invoiceFileLocation, 1)
        }
    } catch (error) {
        console.error("error during invoice loading", error )
    }
}

const runScript = async() => {
    try {
        await CnxPostgress.connect()
        const model = new ModelPostgres()
        await createProjects(model)
        await populateArrangement(model)
        await loadInvoices(model)
    } catch (error) {
        console.log(error)
    } finally {
        await CnxPostgress.disconnect()
    }
}

(async () => {
    await runScript()
})()
