import ModelPostgres from "../model/DAO/ModelPostgres.js"

class MetricsService {

    constructor() {
        this.model = new ModelPostgres()
    }

    getGeneralMetrics = async (startDate, endDate) => {
        const response = await this.model.getGeneralMetrics(startDate, endDate)
        return response
    }



}

export default MetricsService