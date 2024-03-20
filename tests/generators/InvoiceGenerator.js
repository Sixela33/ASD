import faker from "faker";

const invoiceDataGenerator = _ => ({
    invoiceAmount: faker.datatype.float(), 
    vendor: 1, 
    dueDate: new Date(), 
    invoiceNumber:faker.datatype.number() ,
})

const invoiceFlowerDataGenerator = (flowerid, projectid) => ({
    flowerid: flowerid,
    projectid: projectid,
    unitPrice: faker.datatype.number(),
    filledStems: faker.datatype.number(),
})

export {invoiceDataGenerator, invoiceFlowerDataGenerator}
