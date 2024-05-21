import ModelPostgres from "../model/DAO/ModelPostgres.js"
import { validateId } from "./Validations/IdValidation.js"
import { validateNewRole } from "./Validations/RoleValidations.js"
class RoleService {

    constructor() {
        this.model = new ModelPostgres()
    }

    createRole = async (roleName, roleCode) => {
        await validateNewRole({roleName, roleCode})

        await this.model.createRole(roleName, roleCode)
    }

    getUserPermissionLevel = async (userID) => {
        await validateId(userID)
        const res = await this.model.getUserPermissionLevel(userID)
        return res[0]
    }

    getAllPermissionLevels = async () => {
        const response = await this.model.getAllRoles()
        return response.rows
    }

    changeUserPermissions = async (newRoleid, userid) => {
        await validateId(newRoleid)
        await validateId(userid)

        await this.model.changeUserPermissions(newRoleid, userid)
    }

}

export default RoleService