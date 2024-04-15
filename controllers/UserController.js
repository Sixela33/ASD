import UserService from "../services/UserService.js"

class UserController {

    constructor() {
        this.service = new UserService()
    }

    getUsersList = async (req, res, next) => {
        try {
            const {searchEmail, offset} = req.query
            const users = await this.service.getUsers(searchEmail, offset)
            res.status(200).json(users)
        } catch (error) {
            next(error)
        }
    }

    oauthLoginUser = async (req, res, next) => {
        try {

            const {code} = req.query
            
            const {refreshToken} = await this.service.oauthLogin(code)
            
            res.cookie('jwt', refreshToken, { httpOnly: true, secure: true, sameSite: 'None'});
            let redirect_uri = process.env.NODE_ENV == 'production' ? process.env.HOST : process.env.HOST + ':5173'

            res.redirect(`${redirect_uri}/loginSuccess`)
            
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

}

export default UserController