import ModelPostgres from "../model/DAO/ModelPostgres.js"
import Jwt from "jsonwebtoken";
import { validateId, validateQueryString } from "./Validations/IdValidation.js";
import axios from "axios";
import qs from "qs";

class UserService {

    constructor() {
        this.model = new ModelPostgres()
        
    }

    getUsers = async (searchEmail, offset) => {
        await validateId(offset)
        await validateQueryString(searchEmail)
        
        let response =  this.model.getUsers(searchEmail, offset)

        response = await response
        return {users: response.rows}
    }
    
    oauthProcessCode = async (code) => {
        const url = "https://oauth2.googleapis.com/token"

        let redirect_uri = process.env.NODE_ENV == 'production' ? process.env.HOST + '/api/users/oauthlogin' : process.env.HOST + ':' + process.env.PORT + '/api/users/oauthlogin'

        const values = {
            code,
            client_id: process.env.OAUTH_CLIENT_ID,
            client_secret: process.env.OAUTH_CLIENT_SECRET,
            redirect_uri: redirect_uri,
            grant_type: "authorization_code",
        };
        let res

        try {
            res = await axios.post(url, qs.stringify(values), {headers: {"Content-Type": "application/x-www-form-urlencoded"}});
            return res.data
        } catch (error) {
            console.error(error.response.data.error);
            throw { message: error.response.data.error, status: 500 }
        }
    }
    

    oauthLogin = async (code) => {
        let userData
        let refresh_token
        if(process.env.NODE_ENV === 'test'){
            userData = {email: 'alexis@angelsalazardesign.com'}
            refresh_token = ''
        } else {
            const res = await this.oauthProcessCode(code)
            const id_token = res.id_token 
            refresh_token = res.refresh_token 
            userData = Jwt.decode(id_token)
        }

        let existingUser = await this.model.getUserByEmail(userData.email)
        
        if (existingUser.rows?.length != 0) {
            existingUser = existingUser.rows[0]
            return await this.oauthLoginUser(existingUser, refresh_token)
        } else {
            return await this.oauthRegisterUser(userData, refresh_token)
        }
    }

    oauthLoginUser = async (userData, refresh_token) => {
        const refreshToken = await Jwt.sign({"userid": userData.userid, 'google_refresh': refresh_token}, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d'})
        await this.model.setRefreshToken(userData.userid, refreshToken)

        return {refreshToken}
    }

    oauthRegisterUser = async (userData, refresh_token) => {
        await this.model.registerUser(userData.email, userData.name, userData.picture)
        let existingUser = await this.model.getUserByEmail(userData.email)

        if (existingUser.rows?.length == 0) {
            throw { message: "Error while creating new user user", status: 500 };
        }

        existingUser = existingUser.rows[0]

        return await this.oauthLoginUser(existingUser, refresh_token)

    }

    handleRefresh = async (refreshToken) => {

        let user = await this.model.getUserByRefreshToken(refreshToken)

        if (user.rows?.length == 0) {
            throw {message: "Invalid token refresh" ,status: 403}
        }
        user = user.rows[0]

        try {
            // reads the refresh token to get the userID
            let payload = null
            try {
                payload = Jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET)
            } catch (error) {
                throw { message: error.message, status: 401 }   
            }

            //checks if it is the same that the user that had it
            if (payload.userid != user.userid) throw {message: 'Invalid token', status: 403}
            // let userRoles = await this.model.getUserRoles(user.userid)
            delete user.passhash
            let access_token = ''
            try {
                const url = 'https://www.googleapis.com/oauth2/v4/token'
                const values = {
                    client_id: process.env.OAUTH_CLIENT_ID,
                    client_secret: process.env.OAUTH_CLIENT_SECRET,
                    refresh_token: payload.google_refresh,
                    grant_type: 'refresh_token'
                } 

                const response = await axios.post(url, qs.stringify(values), {headers: {"Content-Type": "application/x-www-form-urlencoded"}});
                access_token = response.data.access_token
            } catch (error) {
                console.log("error while refreshing token", error)
            }
            // creates new temporary token
            const accessToken = await Jwt.sign({user, access_token}, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '30m'})

            return {accessToken}
        } catch (error) {

            throw { message: error.message, status: 403 }        

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

    

}

export default UserService