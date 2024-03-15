import faker from "faker";

const userRegister = _ => ({
    username: faker.finance.accountName(), 
    email: faker.internet.email(),
    password: faker.internet.password(),
})

export default {
    userRegister
}