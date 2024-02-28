import schemas from "../../validationObjects/schemas.js"

const validateProject = project => {

    const { error } = schemas.projectSchema.validate(project)
    if (error) {
        throw {message: error.details[0]?.message, status: 403}
    } 

    return true
}

export default validateProject