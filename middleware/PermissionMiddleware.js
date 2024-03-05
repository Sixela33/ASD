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

            let userPermissionLevel = await this.roleService.getUserPermissionLevel(decoded.userid)
            
            const hasPermission = userPermissionLevel >= this.permissionsRequired

            console.log("Caller permissions", userPermissionLevel)
            console.log("Permissions required", this.permissionsRequired)
            console.log('has all roles', hasPermission)
                        
            if (!hasPermission) {
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