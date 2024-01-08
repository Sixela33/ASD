import express from "express"
import cors from "cors";
import corsOptions from "./config/corsOptions.js"
import cookieParser from "cookie-parser";

import errorHandler from "./middleware/ErrorHandler.js";
import credentials from "./middleware/credentials.js";
import PermissionsMiddelware from "./middleware/PermissionMiddleware.js";

import errorLogger from "./loggers/errorLogger.js";
import unhandledErrorLogger from "./loggers/unhandledErrorLogger.js";
import requestLogger from "./loggers/requestLogger.js";

import CnxPostgress from "./model/CnxPostgress.js"
import UserRouter from "./routers/UserRouter.js";
import RoleRouter from "./routers/RoleRouter.js";
import ClientRouter from "./routers/ClientRouter.js";
import ProjectRouter from "./routers/ProjectRouter.js";

class Server {

    constructor(port, host, persistance, logger) {
        this.port = port
        this.host = host
        this.persistance = persistance
        this.logger = logger

        this.app = express()
    }

    async start() {
        this.app.use(express.json());
        this.app.use(credentials)
        this.app.use(express.urlencoded({ extended: true }));
        this.app.use(cors(corsOptions));
        this.app.use(cookieParser());
        this.app.use(express.static('public/dist'))
        this.app.use(requestLogger)

        if(this.logger) {
            this.app.use((req, res, next) => {
                req.logger = this.logger
                next()
            })
        }

        if (this.persistance == 'postgres') {
            await CnxPostgress.connect();
        }

        // -----------------------------------------------
        //                  ROUTES
        // -----------------------------------------------
        const loginreq = new PermissionsMiddelware(['User']).call
        const superuserReq = new PermissionsMiddelware(['SuperUser']).call

        this.app.use('/api/users', new UserRouter().start())
        this.app.use('/api/clients', loginreq, new ClientRouter().start())
        this.app.use('/api/projects', loginreq, new ProjectRouter().start())

        this.app.use('/api/users/roles', superuserReq, new RoleRouter().start())

        this.app.use(function(req, res){
            res.redirect('/')
            //res.sendStatus(404);
        });
        // -----------------------------------------------
        //                 MIDDLEWARES
        // -----------------------------------------------
        
        this.app.use(errorLogger)
        this.app.use(unhandledErrorLogger)

        this.app.use(errorHandler)

        
        // -----------------------------------------------
        //                 SERVER LISTEN
        // -----------------------------------------------
        
        this.server = this.app.listen(this.port, () =>
            console.log(`Express server listening at: ${this.host}:${this.port}`)
        );
        this.server.on("error", (error) =>
            console.log(`Server Error: \n ${error.message}`)
        );

        return this.app

    }

    async stop() {
        if (this.server) {
          this.server.close()
          await CnxPostgress.desconectar()
          this.server = null
          this.io = null
        }
      }
}

export default Server