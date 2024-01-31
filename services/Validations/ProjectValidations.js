import Joi from "joi"

const validateProject = project => {
    const ProjectSchema = Joi.object({
        staffBudget: Joi.number().min(0),
        projectContact: Joi.string().max(255),
        projectDate: Joi.date(),
        projectDescription: Joi.string().max(255),
        clientid: Joi.number().min(0),
        profitMargin: Joi.number(),
        creatorid: Joi.number().min(0)
    })

    const { error } = ProjectSchema.validate(project)
    if (error) {
        throw {message: error.details[0]?.message, status: 403}
    } 

    return true
}

export default validateProject