import ModelPostgres from "../model/DAO/ModelPostgres.js"

class RecurrentProjectCheckpointer {
    constructor() {
        this.model = new ModelPostgres()
    }

    createRecurentProjectCheckpoints = async () => {
        console.log('imprimitneo checkponts')
        let recurrentProjectsids = await this.model.getRecurrentProjects()
        recurrentProjectsids = recurrentProjectsids.rows
        
        recurrentProjectsids = recurrentProjectsids.map(project => {
            return project.projectid
        })
        console.log('recurrentProjectsids', recurrentProjectsids)
    
        for (let id of recurrentProjectsids) {
            await this.makeProjectCheckpoint(id)
        }
    }

    makeProjectCheckpoint = async (id) => {
        let projectArrangements = this.model.getProjectArrangements(id)
        let projectData = this.model.getProjectByID(id)
        let projectExtras = this.model.getProjectExtras(id) 
    
        projectArrangements = await projectArrangements
        projectData = await projectData
        projectExtras = await projectExtras
    
        projectArrangements = projectArrangements.rows
        
        projectData = projectData.rows[0]
        projectExtras = projectExtras.rows
    
        const totalExtrasCost = projectExtras.reduce(
            (accumulator, extra) => accumulator + extra.clientcost,
            0,
        );
    
        const totalArrangementsCost = projectArrangements.reduce(
            (accumulator, flower) => accumulator + (flower.clientcost * flower.arrangementquantity),
            0,
        );
    
        this.model.makeProjectCheckpoint(projectData, totalExtrasCost, totalArrangementsCost)
    
    }

}

export default RecurrentProjectCheckpointer