import { projectSchema } from "../../validationObjects/ProjectSchemas.js"

const validateProject = project => {

    const { error } = projectSchema.validate(project)
    if (error) {
        throw {message: error.details[0]?.message, status: 403}
    } 

    return true
}

export default validateProject