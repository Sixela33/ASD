import RoleService from "../services/RoleService.js"

class RoleController {

    constructor() {
        this.service = new RoleService()
    }

    createRole = async (req, res, next) => {
        try {
            const { roleName, roleCode } = req.body
            await this.service.createRole(roleName, roleCode)
            res.sendStatus(200)
        } catch (error) {
            next(error)
        }
    } 

    getAllPermissionLevels = async (req, res, next) => {
        try {
            const permissions = await this.service.getAllPermissionLevels()
            res.json(permissions)
        } catch (error) {
            next(error)
        }
    }

    changeUserPermissions = async (req, res, next) => {
        try {
            const { newRoleid, userid } = req.body
            await this.service.changeUserPermissions(newRoleid, userid)
            res.sendStatus(200)
        } catch (error) {
            next(error)
        }
    } 
    
}

export default RoleController