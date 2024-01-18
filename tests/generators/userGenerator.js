import faker from "faker";

const userRegister = () => ({
    username: faker.finance.accountName(), 
    email: faker.internet.email(),
    password: faker.internet.password({ length: 20 })
})

export default {
    userRegister
}