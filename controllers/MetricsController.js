import MetricsService from "../services/MetricsService.js"

class MetricsController {

    constructor() {
        this.service = new MetricsService()
    }
    
    getGeneralMetrics = async (req, res, next) => {
        try {
            const {startDate, endDate} = req.query
            console.log("req.query", req.query)
            const response = await this.service.getGeneralMetrics(startDate, endDate)
            res.json(response)
        } catch (error) {
            next(error)
        }
    }

}

export default MetricsController