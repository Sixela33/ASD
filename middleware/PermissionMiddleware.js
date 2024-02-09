import ModelPostgres from "../model/DAO/ModelPostgres.js"
import RoleService from "../services/RoleService.js";
import Jwt from 'jsonwebtoken';
import ROLES_LIST from "../config/rolesList.js";

// this middleware checks if the user has the permissions needed to access the route
class PermissionsMiddelware {
    constructor(permissionRequired = []) {
        this.permissionsRequired = permissionRequired
        this.roleService = new RoleService()

        this.call = this.call.bind(this);
    }

    async call(req, res, next) {
        try {
            const token = req.header('Authorization');
            if (!token) {
                return res.status(403).json({ message: 'Unauthorised' })
            }
            let decoded = null

            try {
                decoded = Jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
            } catch (error) {
                throw { message: error.message, status: 403 }   
            }
            // THIS MIGHT GO INTO THE ROLE CONTROLLER
            let userRoles = await this.roleService.getUserRoles(decoded.userid)
            
            const hasAllRoles = this.permissionsRequired.map(role => userRoles.includes(role)).find(val => val === true)
            console.log("Caller permissions",userRoles)
            console.log("Permissions required", this.permissionsRequired)
            console.log('has all roles', hasAllRoles)
            
            //const hasAllRoles = this.permissionsRequired.map(role => userRoles.includes(role));
            
            if (!hasAllRoles) {
                return res.status(401).json({ message: 'Insufficient permissions' });
            }
    
            req.user = decoded
            next()
        } catch (error) {
            next(error)
        }
    
    }
}

export default PermissionsMiddelware