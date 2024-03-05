import RoleService from "../services/RoleService.js"

class RoleController {

    constructor() {
        this.service = new RoleService()
    }

    createRole = async (req, res, next) => {
        try {
            const { roleName, roleCode } = req.body

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


    /*
        addRoleToUser = async (req, res, next) => {
            try {
                const {roleid, userid} = req.body
                await this.service.addRoleToUser(roleid, userid)
                req.logger.warn(`userid:${req.user.userid} Has given the roleid:${roleid} to userid:${userid}`)
                res.sendStatus(200)
            } catch (error) {
                next(error)
            }
        } 

        removeRoleUser = async (req, res, next) => {
            try {
                const {roleid, userid} = req.body
                await this.service.removeRoleUser(roleid, userid)
                req.logger.warn(`userid:${req.user.userid} Has removed the roleid:${roleid} from userid:${userid}`)
                res.sendStatus(200)
            } catch (error) {
                next(error)
            }
        } 

        removeRole = async (req, res, next) => {
            try {
                
            } catch (error) {
                next(error)
            }
        } 
    */
    
}

export default RoleController