import express from "express"
import cors from "cors";
import corsOptions from "./config/corsOptions.js"
import cookieParser from "cookie-parser";
import messageLogger from "./loggers/messageLogger.js";

import errorHandler from "./middleware/ErrorHandler.js";
import credentials from "./middleware/credentials.js";
import PermissionsMiddelware from "./middleware/PermissionMiddleware.js";

import errorLogger from "./loggers/errorLogger.js";
import unhandledErrorLogger from "./loggers/unhandledErrorLogger.js";
import requestLogger from "./loggers/requestLogger.js";

import CnxPostgress from "./model/CnxPostgress.js"
import UserRouter from "./routers/UserRouter.js";
import RoleRouter from "./routers/RoleRouter.js";
import ProjectRouter from "./routers/ProjectRouter.js";
import FlowerRouter from "./routers/FlowerRouter.js";
import ArrangementRouter from "./routers/ArrangementRouter.js";
import VendorRouter from "./routers/VendorRouter.js";
import ClientRouter from "./routers/ClientRouter.js";
import InvoiceRouter from "./routers/InvoiceRouter.js";

import ROLES_LIST from "./config/rolesList.js";
import ExtraServicesRouter from "./routers/ExtraServicesRouter.js";
import ContactRouter from "./routers/ContactRouter.js";
import BankStatementRouter from "./routers/BankStatementRouter.js";
import BankTransactionRouter from "./routers/BankTransactionsRouter.js";

/*
    This code was written by S1X3L4

    If you are trying to maintain this code and have any questions just let me know :)
    contact: alexis.janko@gmail.com
*/

class Server {

    constructor(port, host, persistance, fileStorage) {
        this.port = port
        this.host = host
        this.persistance = persistance
        this.fileStorage = fileStorage
        this.app = express()
    }

    async start() {

        // -----------------------------------------------
        //                 MIDDLEWARES
        // -----------------------------------------------
        
        this.app.use(express.json({ limit: '50mb' }));
        this.app.use(express.urlencoded({ limit: '50mb', extended: true }));
        this.app.use(credentials)
        this.app.use(cors(corsOptions));
        this.app.use(cookieParser());
        this.app.use(express.static("public/dist"));
        this.app.use(express.static("public"));
        this.app.use('/api/SavedFiles', express.static('SavedFiles'));
        this.app.use(requestLogger)
        
        if (this.persistance == 'postgres') {
            await CnxPostgress.connect();
        }

        this.app.use((req, res, next) => {
            req.logger = messageLogger
            next()
        })
     
        // -----------------------------------------------
        //                  ROUTES                        
        // -----------------------------------------------

        const loginreq = new PermissionsMiddelware(ROLES_LIST['User']).call
        const staffuserReq = new PermissionsMiddelware(ROLES_LIST['Staff']).call
        const superuserReq = new PermissionsMiddelware(ROLES_LIST['Admin']).call

        this.app.use('/api/users', new UserRouter().start())
        this.app.use('/api/users/roles', superuserReq, new RoleRouter().start())
        this.app.use('/api/flowers', loginreq, new FlowerRouter(this.fileStorage).start())
        this.app.use('/api/projects', loginreq, new ProjectRouter().start())
        this.app.use('/api/arrangements', loginreq, new ArrangementRouter().start())
        this.app.use('/api/clients', loginreq, new ClientRouter().start())
        this.app.use('/api/vendors', loginreq, new VendorRouter().start())
        this.app.use('/api/invoices', staffuserReq, new InvoiceRouter(this.fileStorage).start())
        this.app.use('/api/extraServices', staffuserReq, new ExtraServicesRouter().start())
        this.app.use('/api/contacts', loginreq, new ContactRouter().start())
        this.app.use('/api/bankStatements', staffuserReq, new BankStatementRouter(this.fileStorage).start())
        this.app.use('/api/bankTransactions', staffuserReq, new BankTransactionRouter().start())
        
        // -----------------------------------------------
        //                 ERROR HANDLERS
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