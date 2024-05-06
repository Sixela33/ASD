import RoleService from "../services/RoleService.js";
import Jwt from 'jsonwebtoken';

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

            console.log("token", token)


            try {
                decoded = Jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
            } catch (error) {
                throw { message: error.message, status: 403 }   
            }

            let userPermissionLevel = await this.roleService.getUserPermissionLevel(decoded.user.userid)

            const hasPermission = userPermissionLevel >= this.permissionsRequired
                        
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