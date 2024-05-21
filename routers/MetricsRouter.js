import express from 'express'
import MetricsController from '../controllers/MetricsController.js'

// all the roles routes
class MetricsRouter {

    constructor(){
        this.controller = new MetricsController()
        this.router = express.Router()
    }

    start(){
        
        this.router.get('/getGeneralMetrics', this.controller.getGeneralMetrics)
        return this.router
    }
    
    
}




export default MetricsRouter