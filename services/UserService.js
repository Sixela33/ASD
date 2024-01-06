import ModelPostgres from "../model/DAO/ModelPostgres.js"
import bcrypt from "bcrypt";
import Jwt from "jsonwebtoken";


class UserService {

    constructor() {
        this.model = new ModelPostgres()
    
    }

    getUserById = async (userid) => {
        const response = await this.model.getUserById(userid)
        const roles = await this.model.getUserRoles(userid)
        const allRoles = await this.model.getAllRoles()

        return {user: response.rows, roles: roles, allRoles: allRoles.rows}
    }

    getUsers = async () => {
        const response = await this.model.getUsers()
        return response.rows
    }

    registerUser = async (username, email, password) => {
        const prevUser = await this.model.getUserByEmail(email)

        if (prevUser.rows?.length != 0){
            throw { message: "This user already exists", status: 409 }; 
        }
        
        const passHash = await bcrypt.hash(password, 10)
        await this.model.registerUser(username, email, passHash)
        return {username, email}
    }

    loginUser = async (email, password) => {

        let user = await this.model.getUserByEmail(email)

        if (user.rows?.length == 0) {
            throw { message: "Invalid login data", status: 401 };
        }

        user = user.rows[0]

        const hasRightPass = await bcrypt.compare(password, user.passhash)
        
        if (hasRightPass) {
            delete user.passhash
            let userRoles = await this.model.getUserRoles(user.userid)

            const accessToken = await Jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
            const refreshToken = await Jwt.sign({"userid": user.userid}, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '1d'})
            await this.model.setRefreshToken(user.userid, refreshToken)

            console.log(user)
            return {accessToken, refreshToken, userRoles}
        } else {
            throw { message: "Invalid login data", status: 401 };
        }
        
    }

    forgotPassword = async (email) => {
        let user = await this.model.getUserByEmail(email)

        if (user.rows?.length == 0) {
            throw { message: "This email does not have an account linked", status: 401 };
        }
        user = user.rows[0]

        const secret = process.env.CLAVE_SECRETA + user.passhash

        const payload = {
            id: user.userid,
            email: user.email
        }
        
        const token = Jwt.sign(payload, secret, {expiresIn: '30m'})
        const link = `${process.env.HOST}:${process.env.FRONTENDPORT}/setNewPass/${user.userid}/${token}`
        return {link, userid: user.userid}

    }

    passwordRecovery = async (id, code, newPassword) => {

        let user = await this.model.getUserByID(id)

        if (user.rows?.length == 0) {
            throw { message: "This user does not exist", status: 401 };
        }
        user = user.rows[0]

        const secret = process.env.CLAVE_SECRETA + user.passhash
        try {
            const payload = Jwt.verify(code, secret)

            const salt = await bcrypt.genSalt(12)
            const newPassHash = await bcrypt.hash(newPassword, salt)
            await this.model.changePassword(id, newPassHash)

            return true
        } catch (error) {
            throw { message: error.message, status: 401 }        
        }
    }

    handleLogout = async (refreshToken) => {
        let user = await this.model.getUserByRefreshToken(refreshToken)
        if (user.rows?.length == 0) {
            throw {message: "invalid token" ,status: 403}
        }
        
        user = user.rows[0]

        await this.model.setRefreshToken(user.userid, "")
        return

    }

    handleRefresh = async (refreshToken) => {
        let user = await this.model.getUserByRefreshToken(refreshToken)

        if (user.rows?.length == 0) {
            throw {message: "Invalid token" ,status: 403}
        }
        user = user.rows[0]

        try {
            // reads the refresh token to get the userID
            const payload = Jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET)
            //checks if it is the same that the user that had it
            if (payload.userid != user.userid) throw {message: 'Invalid token', status: 403}
            let userRoles = await this.model.getUserRoles(user.userid)
            delete user.passhash
            
            // creates new temporary token
            const accessToken = await Jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '1h'})
    
            return {accessToken, userRoles}
        } catch (error) {

            throw { message: error.message, status: 403 }        

        }

    }

}

export default UserService