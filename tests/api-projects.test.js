import { expect } from "chai"
import supertest from "supertest"
import "dotenv/config"

const request = supertest(process.env.HOST + ':' + process.env.PORT)

describe('Projects Routes api/projects', () => {
    let adminToken 

    before(async () => {

        const adminCredentials = {
            email: 'aj@gmail.com',
            password: 'QWERQWER1',
        }

        const loginResponse = await request.get('/api/users/oauthlogin').send(adminCredentials)

        const refreshToken = loginResponse.headers['set-cookie']

        const refreshResponse = await request.get('/api/users/refresh').set('Cookie', refreshToken)

        adminToken = refreshResponse.body
    })

    describe('POST /create', () => {
        it('should create a new project if all data is sent', async () => {

            
            const queryObject = {
                staffBudget: 100, 
                contact: "me", 
                date: new Date(), 
                description: "best project ever", 
                client: 3, 
                profitMargin: 0.7, 
                arrangements: [
                    {
                        arrangementType: 1,
                        arrangementDescription:"BRIDAL",
                        clientCost:100,
                        arrangementQuantity:2,
                    },
                    {
                        arrangementType: 2,
                        arrangementDescription:"Blue",
                        clientCost:200,
                        arrangementQuantity:1,
                    },
                ],
                extras: [
                    {
                        description: 'Building',
                        clientcost: 1000
                    },
                    {
                        description: 'Deconstruction',
                        clientcost: 1000
                    },
                ]
            }
            const response = await request.post('/api/projects/create').set('Authorization', `${adminToken}`).send(queryObject)

            expect(response.status).to.equal(200)

        })

        it('should create a new project without arrangements', async () => {

            
            const queryObject = {
                staffBudget: 100, 
                contact: "me", 
                date: new Date(), 
                description: "best project ever", 
                client: 3, 
                profitMargin: 0.7, 
                extras: [
                    {
                        description: 'Building',
                        clientcost: 1000
                    },
                    {
                        description: 'Deconstruction',
                        clientcost: 1000
                    },
                ]
            }
            const response = await request.post('/api/projects/create').set('Authorization', `${adminToken}`).send(queryObject)

            expect(response.status).to.equal(200)

        })

        it('should create a new project with no extras', async () => {

            
            const queryObject = {
                staffBudget: 100, 
                contact: "me", 
                date: new Date(), 
                description: "best project ever", 
                client: 3, 
                profitMargin: 0.7, 
                arrangements: [
                    {
                        arrangementType: 1,
                        arrangementDescription:"BRIDAL",
                        clientCost:100,
                        arrangementQuantity:2,
                    },
                    {
                        arrangementType: 2,
                        arrangementDescription:"Blue",
                        clientCost:200,
                        arrangementQuantity:1,
                    },
                ]
            }
            const response = await request.post('/api/projects/create').set('Authorization', `${adminToken}`).send(queryObject)

            expect(response.status).to.equal(200)

        })

        it('should return 400 with invalid data', async () => {

            const queryObject = {
                staffBudget: 100, 
                contact: "me", 
                date: new Date(), 
                description: "best project ever", 
                client: "pepe",  // string instead of int
                profitMargin: 0.7, 
                arrangements: []
            }
            const response = await request.post('/api/projects/create').set('Authorization', `${adminToken}`).send(queryObject)

            expect(response.status).to.equal(400)
        })

        it('should return 400 with invalid arrangement data', async () => {

            const queryObject = {
                staffBudget: 100, 
                contact: "me", 
                date: new Date(), 
                description: "best project ever", 
                client: "pepe",  // string instead of int
                profitMargin: 0.7, 
                arrangements: [
                    {
                        arrangementType: 1,
                        arrangementDescription:"BRIDAL",
                        clientCost:'pepe', // sending string instead of int
                        arrangementQuantity:2,
                    },
                    {
                        arrangementType: 2,
                        arrangementDescription:"Blue",
                        clientCost:-1, // clientCost should be positive
                        arrangementQuantity:1,
                    },
                ]
            }
            const response = await request.post('/api/projects/create').set('Authorization', `${adminToken}`).send(queryObject)

            expect(response.status).to.equal(400)
        })

        it('should return 400 with invalid extras data', async () => {

            const queryObject = {
                staffBudget: 100, 
                contact: "me", 
                date: new Date(), 
                description: "best project ever", 
                client: "pepe",  // string instead of int
                profitMargin: 0.7, 
                arrangements: [],
                extras: [
                    {
                        description: 'Building',
                        clientcost: -1 // clientCost should be >= 0
                    },
                ]
            }
            const response = await request.post('/api/projects/create').set('Authorization', `${adminToken}`).send(queryObject)

            expect(response.status).to.equal(400)
        })

        
    })

    describe('POST /addArrangement/:id', () => {
        it("should add an arrangement to the project", async () => {
            let projectToAddTo = 1
            const arrangementData = {
                arrangementType: 1,
                arrangementDescription:"BRIDAL",
                clientCost:100,
                arrangementQuantity:2,
            }

            const response = await request.post('/api/projects/addArrangement/' + projectToAddTo).set('Authorization', `${adminToken}`).send(arrangementData)

            expect(response.status).to.equal(200)

        })

        it('should return 400 if invalid data was sent', async () => {
            let projectToAddTo = 1
            const arrangementData = {
                arrangementType: 1,
                clientCost:100,
                arrangementQuantity:2,
            }

            const response = await request.post('/api/projects/addArrangement/' + projectToAddTo).set('Authorization', `${adminToken}`).send(arrangementData)

            expect(response.status).to.equal(400)
        })

        it('should return 400 if invalid id was sent', async () => {
            let projectToAddTo = undefined
            const arrangementData = {
                arrangementType: 1,
                clientCost:100,
                arrangementQuantity:2,
            }

            const response = await request.post('/api/projects/addArrangement/' + projectToAddTo).set('Authorization', `${adminToken}`).send(arrangementData)

            expect(response.status).to.equal(400)
        })


    })

    //this.router.patch('/:id', this.controller.editProjectData)

    describe('PATCH /:id', () => {
        it('should edit arrangement data', async () => {
            let arrangementIDToEdit = 1
            let projectData = {
                staffBudget: 1,
                projectContact: "Jhon",
                projectDate: new Date(),
                projectDescription: "projectt",
                clientid: 1,
                profitMargin: 0.5
            }

            const response = await request.patch('/api/projects/' + arrangementIDToEdit).set('Authorization', `${adminToken}`).send(projectData)

            expect(response.status).to.equal(200)

        })  

        it('should retirn 400 with invalid data', async () => {
            let arrangementIDToEdit = 1
            let projectData = {
                projectContact: "Jhon",
                projectDate: new Date(),
                projectDescription: "projectt",
                clientid: 1,
                profitMargin: 0.5
            }

            const response = await request.patch('/api/projects/' + arrangementIDToEdit).set('Authorization', `${adminToken}`).send(projectData)

            expect(response.status).to.equal(400)
        })

        it('should retirn 400 with invalid id', async () => {
            let arrangementIDToEdit = undefined
            let projectData = {
                staffBudget: 1,
                projectContact: "Jhon",
                projectDate: new Date(),
                projectDescription: "projectt",
                clientid: 1,
                profitMargin: 0.5
            }

            const response = await request.patch('/api/projects/' + arrangementIDToEdit).set('Authorization', `${adminToken}`).send(projectData)

            expect(response.status).to.equal(400)
        })
    })
   
    describe('POST /close/:id', () => {
        it("should close project", async () => {
            const arrangementIDToClose = 2
            const response = await request.post('/api/projects/close/' + arrangementIDToClose).set('Authorization', `${adminToken}`)

            expect(response.status).to.equal(200)
        })

        it("should return 400 with invalid project id", async () => {
            const arrangementIDToClose = undefined
            const response = await request.post('/api/projects/close/' + arrangementIDToClose).set('Authorization', `${adminToken}`)

            expect(response.status).to.equal(400)
        })
    })

    describe('POST /open/:id', () => {
        it("should close project", async () => {
            const arrangementIDToClose = 2
            const response = await request.post('/api/projects/close/' + arrangementIDToClose).set('Authorization', `${adminToken}`)

            expect(response.status).to.equal(200)
        })

        it("should return 400 with invalid project id", async () => {
            const arrangementIDToClose = undefined
            const response = await request.post('/api/projects/close/' + arrangementIDToClose).set('Authorization', `${adminToken}`)

            expect(response.status).to.equal(400)
        })
    })

    describe('GET /list/:offset', () => {
        it('should return a list of projects', async () => {
            const response = await request.get('/api/projects/list/0').set('Authorization', `${adminToken}`)

            //console.log(response.body)
            expect(response.status).to.equal(200)
            expect(response.body).to.be.an('array')
            response.body.forEach(project => {
                expect(project).to.have.property("projectid")
                expect(project).to.have.property("clientid")
                expect(project).to.have.property("projectdescription")
                expect(project).to.have.property("projectcontact")
                expect(project).to.have.property("isclosed")
                expect(project).to.have.property("projectclient")
                expect(project).to.have.property("projectdate")
                expect(project).to.have.property("projectstatus")
            });
        })

        it('should not break with wrong offset value', async () => {
            const response = await request.get('/api/projects/list/undefined').set('Authorization', `${adminToken}`)

            expect(response.status).to.equal(400)

        })

    })

    describe('POST /manyByID', () => {
        it("should get projects by their ids", async () => {

            const projectsToGet = [3, 4, 5]

            const response = await request.post('/api/projects/manyByID').set('Authorization', `${adminToken}`).send({ids: projectsToGet})

            expect(response.status).to.equal(200)
            expect(response.body).to.have.property('projects')
            expect(response.body).to.have.property('flowers')
            expect(response.body.projects).to.be.an('array')
            expect(response.body.flowers).to.be.an('array')

            response.body.projects.forEach(project => {
                expect(project).to.have.property("projectid")
                expect(project).to.have.property("clientid")
                expect(project).to.have.property("projectdate")
                expect(project).to.have.property("projectdescription")
                expect(project).to.have.property("projectcontact")
                expect(project).to.have.property("projectclient")
            });

            response.body.flowers.forEach(project => {
                expect(project).to.have.property("projectid")
                expect(project).to.have.property("arrangementid")
                expect(project).to.have.property("flowerid")
                expect(project).to.have.property("flowername")
                expect(project).to.have.property("flowercolor")
                expect(project).to.have.property("amount")
                expect(project).to.have.property("unitprice")
            });

        })
        
        it("should should return 400 if no ids are provided", async () => {
            const projectsToGet = []

            const response = await request.post('/api/projects/manyByID').set('Authorization', `${adminToken}`).send({ids: projectsToGet})

            expect(response.status).to.equal(400)

        })
        
        
    })

    describe('GET /arrangements/:id', () => {
        it('should get the arrangements for a project', async () => {
            let idToGet = 1

            const response = await request.get('/api/projects/arrangements/'+ idToGet).set('Authorization', `${adminToken}`)

            expect(response.status).to.equal(200)

            let body = response.body 

            expect(body).to.have.property('project')
            expect(body).to.have.property('arrangements')

            expect(body.project[0]).to.not.be.undefined

            expect(body.project[0]).to.have.property("projectid")
            expect(body.project[0]).to.have.property("clientid")
            expect(body.project[0]).to.have.property("projectdescription")
            expect(body.project[0]).to.have.property("projectcontact")
            expect(body.project[0]).to.have.property("profitmargin")
            expect(body.project[0]).to.have.property("staffbudget")
            expect(body.project[0]).to.have.property("creatorid")
            expect(body.project[0]).to.have.property("isclosed")
            expect(body.project[0]).to.have.property("projectclient")
            expect(body.project[0]).to.have.property("projectdate")

            expect(body.arrangements).to.be.an('array')
            
            body.arrangements.forEach(arrangement => {
                expect(arrangement).to.have.property("arrangementid")
                expect(arrangement).to.have.property("projectid")
                expect(arrangement).to.have.property("arrangementdescription")
                expect(arrangement).to.have.property("clientcost")
                expect(arrangement).to.have.property("arrangementquantity")
                expect(arrangement).to.have.property("designerid")
                expect(arrangement).to.have.property("arrangementtype")
                expect(arrangement).to.have.property("typename")
            })
        })

        it('should not break if an invalid id is passed', async () => {
            const response = await request.get('/api/projects/arrangements/'+ undefined).set('Authorization', `${adminToken}`)

            expect(response.status).to.equal(400)
        })
    })

})