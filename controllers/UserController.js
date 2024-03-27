import UserService from "../services/UserService.js"

class UserController {

    constructor() {
        this.service = new UserService()
    }

    getUsersList = async (req, res, next) => {
        try {
            const users = await this.service.getUsers()
            res.status(200).json(users)
        } catch (error) {
            next(error)
        }
    }

    registerUser = async (req, res, next) => {
        try {
            const {username, email, password} = req.body
            await this.service.registerUser(username, email, password)
            req.logger.info(`userid:${req.user.userid} Has created a user`)
            res.status(201).send("User created successfully.")

        } catch (error) {
            next(error)
        }
    }

    loginUser = async (req, res, next) => {
        try {
            const {email, password} = req.body

            const {accessToken, refreshToken} = await this.service.loginUser(email, password)
            req.logger.warn(`${email} Has Logged in`)

            res.cookie('jwt', refreshToken, { httpOnly: true, secure: true, sameSite: 'None'});

            res.status(200).json({accessToken})
        } catch (error) {
            next(error)
        }
    }

    handleRefresh = async (req, res, next) => {
        try {
            const cookies = req.cookies;

            const {accessToken} = await this.service.handleRefresh(cookies.jwt)
            res.json(accessToken)
        } catch (error) {
            next(error)
        }
    }

    handleLogout = async (req, res, next) => {
        try {
            const cookies = req.cookies;

            if (!cookies?.jwt) return res.sendStatus(204)
            await this.service.handleLogout(cookies.jwt)

            res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true });
            res.sendStatus(204);

        } catch (error) {
            res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true });
            next(error)

        }
    }

    forgotPassword = async (req, res, next) => {
        try {
            const { email } = req.body
            req.logger.warn(`email:${email} Passowrd change requested`)
            const {link} = await this.service.forgotPassword(email)
            const message = 'An email containing the password recovery link has been sent to your email address. Please check your inbox (and possibly your spam folder) for further instructions on resetting your password.'
            res.json({link, message})
        } catch (error) {
            next(error)
        }
    }

    passwordRecovery = async (req, res, next) => {
        try {
            const { password, code, id } = req.body
            await this.service.passwordRecovery(id, code, password)
            req.logger.warn(`userid:${id} Has Changed his password`)
            res.status(200).send('Password changed succesfully')
        } catch (error) {
            next(error)
        }
    }

}

export default UserController