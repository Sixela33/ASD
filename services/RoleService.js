import ModelPostgres from "../model/DAO/ModelPostgres.js"
import ROLES_LIST from "../config/rolesList.js"

class RoleService {

    constructor() {
        this.model = new ModelPostgres()
    }

    getUserPermissionLevel = async (userID) => {
        const res = await this.model.getUserPermissionLevel(userID)
        return res[0]
    }

    getAllPermissionLevels = async () => {
        return ROLES_LIST
    }

    changeUserPermissions = async (newRoleid, userid) => {
        await this.model.changeUserPermissions(newRoleid, userid)
    }

    /*
        userHasRole = async(roleid, userid) => {
            const res = await this.model.userHasRole(roleid, userid)
            return res.rows != 0

        }

        getUserRoles = async (userid) => {
            const res = await this.model.getUserRoles(userid)
            return res
        }

        createRole = async () => {

        }

        removeRoleUser = async (roleid, userid) => {
            
            if (this.userHasRole(roleid, userid)) {
                await this.model.removeRoleUser(roleid, userid)
            } else {
                throw { message: "This user does not have that role", status: 409 }
            }
        }

        removeRole = async (roleID, userID) => {

        }


        addRoleToUser = async (roleID, userID) => {
            await this.model.addRoleToUser(roleID, userID)
        }
    */


}

export default RoleService