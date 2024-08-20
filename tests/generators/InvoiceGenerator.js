import faker from "faker";

const invoiceDataGenerator = _ => ({
    invoiceAmount: faker.datatype.float(), 
    vendor: 1, 
    dueDate: new Date(), 
    invoiceNumber:faker.datatype.string(15)
})

const invoiceFlowerDataGenerator = (flowerid, projectid) => ({
    flowerid: flowerid,
    projectid: projectid,
    unitPrice: faker.datatype.float({min:1, max:100}),
    numstems: faker.datatype.number({min:1, max: 100})
})

export {invoiceDataGenerator, invoiceFlowerDataGenerator}
