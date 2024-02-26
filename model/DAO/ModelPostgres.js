import CnxPostgress from "../CnxPostgress.js";

class ModelPostgres {

    constructor () {
        if (!CnxPostgress.connection) throw new Error("The databse connection has not been established")
    }

    validateDatabaseConnection() {
        if (!CnxPostgress.connection) throw new Error("The database connection has not been established");
    }
    

    runQuery = async (query) => {
        this.validateDatabaseConnection()
        await CnxPostgress.db.query(query)

    }

    // -----------------------------------------------
    //                    USERS
    // -----------------------------------------------

    getUserByEmail = async (email) => {
        this.validateDatabaseConnection()
        return await CnxPostgress.db.query('SELECT * FROM users WHERE email = $1;', [email])        
    }

    getUserById = async (userID) => {
        this.validateDatabaseConnection()
        return await CnxPostgress.db.query('SELECT * FROM users WHERE userid = $1;', [userID])        
    }

    getUserByRefreshToken = async (refreshToken) => {
        this.validateDatabaseConnection()
        return await CnxPostgress.db.query('SELECT * FROM users WHERE refreshtoken = $1;', [refreshToken])     
    }

    setRefreshToken = async (userID, refreshToken) => {
        this.validateDatabaseConnection()
        return await CnxPostgress.db.query('UPDATE users SET refreshtoken = $1 WHERE userid = $2;', [refreshToken, userID])     
    }

    getUsers = async () => {
        this.validateDatabaseConnection()
        return await CnxPostgress.db.query("SELECT * FROM users;")

    }

    registerUser = async (username, email, passHash) => {
        this.validateDatabaseConnection()
        // await CnxPostgress.db.query('INSERT INTO users (username, email, passhash) VALUES ($1, $2, $3);', [username, email, passHash])
        // this funciont creates the user and asigns it to the "User" role
        await CnxPostgress.db.query('SELECT createUser($1, $2, $3)', [username, email, passHash])
                
    }

    changePassword = async (userID, newPassHash) => {
        this.validateDatabaseConnection()
        await CnxPostgress.db.query('UPDATE users SET passhash = $1 WHERE userid = $2;', [newPassHash, userID])
    }

    // -----------------------------------------------
    //                USER PERMISSIONS
    // -----------------------------------------------

    createRole = async (roleName) => {
        this.validateDatabaseConnection()
        await CnxPostgress.db.query('INSERT INTO userrole (rolename) VALUES ($1);', [roleName])
    }

    getAllRoles = async () => {
        this.validateDatabaseConnection()
        return await CnxPostgress.db.query('SELECT roleid, rolename FROM userrole')
    }

    getRoleByID = async (roleid) => {
        this.validateDatabaseConnection()
        return await CnxPostgress.db.query('SELECT * FROM userrole WHERE roleid = $1;', [roleid])
    } 

    addRoleToUser = async (roleID, userID) => {
        this.validateDatabaseConnection()
        await CnxPostgress.db.query('INSERT INTO roleXuser (userid, roleid) VALUES ($1, $2);', [userID, roleID])
    }

    getUserRoles = async (userID) => {
        this.validateDatabaseConnection()        
        const response = await CnxPostgress.db.query('SELECT r.roleName FROM roleXuser rxu JOIN userRole r ON rxu.roleID = r.roleID WHERE rxu.userID = $1;', [userID])

        const roles = response.rows.map(row => row.rolename);
        return roles;
    
    }

    removeRoleUser = async (roleID, userID) => {
        this.validateDatabaseConnection()
        return await CnxPostgress.db.query('DELETE FROM roleXuser WHERE roleid = $1 AND userid = $2;', [roleID, userID])
    }

    userHasRole = async (roleID, userID) => {
        this.validateDatabaseConnection()
        return await CnxPostgress.db.query('SELECT * FROM roleXuser WHERE roleid = $1 AND userid = $2;', [roleID, userID])
    }

    // -----------------------------------------------
    //                    CLIENTS
    // -----------------------------------------------

    createClient = async (clientName) => {
        this.validateDatabaseConnection()
        await CnxPostgress.db.query('INSERT INTO clients (clientname) VALUES ($1);', [clientName])

    }

    getClients = async () => {
        this.validateDatabaseConnection()
        return CnxPostgress.db.query('SELECT * FROM clients ORDER BY clientname;')
    }

    // -----------------------------------------------
    //                    VENDORS
    // -----------------------------------------------

    getVendors = async () => {
        this.validateDatabaseConnection()
        return await CnxPostgress.db.query('SELECT vendorid, vendorname FROM flowerVendor ORDER BY vendorname;')
        //return await CnxPostgress.db.query('SELECT vendorid, vendorname FROM flowerVendor LIMIT $1 OFFSET $2 ORDER BY vendorname;')
    }

    createVendor = async (vendorName) => {
        this.validateDatabaseConnection()
        await CnxPostgress.db.query('INSERT INTO flowerVendor (vendorName) VALUES ($1);', [vendorName])

    }

    // -----------------------------------------------
    //                    CLIENTS
    // -----------------------------------------------

    createClients = async (clientName) => {
        this.validateDatabaseConnection()
        await CnxPostgress.db.query('INSERT INTO clients (clientName) VALUES ($1); ', [clientName])
    }

    // -----------------------------------------------
    //                   PROJECTS
    // -----------------------------------------------

    createProject = async (staffBudget, projectContact, projectDate, projectDescription, projectClientID, profitMargin, creatorid, arrangements) => {
        this.validateDatabaseConnection()
        await CnxPostgress.db.query("SELECT createProject($1::DATE, $2::VARCHAR, $3::VARCHAR, $4::FLOAT, $5::FLOAT, $6::INT, $7::INT, $8::JSONB[]);", [projectDate, projectDescription, projectContact, staffBudget, profitMargin, projectClientID, creatorid, arrangements]);
    }

    closeProject = async (id) => {
        this.validateDatabaseConnection()
        await CnxPostgress.db.query('UPDATE projects SET isClosed = $1 WHERE projectID = $2;', [true, id])
    }

    openProject = async (id) => {
        this.validateDatabaseConnection()
        await CnxPostgress.db.query('UPDATE projects SET isClosed = $1 WHERE projectID = $2;', [false, id])
    }

    getProjectByID = async (id) => {
        this.validateDatabaseConnection()
        return await CnxPostgress.db.query(
            "SELECT projects.*, clients.clientName AS projectclient, TO_CHAR(projects.projectDate, 'MM-DD-YYYY') AS projectDate FROM projects INNER JOIN clients ON projects.clientID = clients.clientID WHERE projects.projectID = $1;",
            [id]
        );
    }

    getManyProjectsByID = async (ids) => {
        this.validateDatabaseConnection()
        return await CnxPostgress.db.query(
            "SELECT projects.*, clients.clientName AS projectclient, TO_CHAR(projects.projectDate, 'MM-DD-YYYY') AS projectDate FROM projects INNER JOIN clients ON projects.clientID = clients.clientID WHERE projects.projectID IN (SELECT * FROM UNNEST($1::int[]));",
            [ids]
        );
    }

    /*
        projectid
        projectclient
        projectdescription
        projectcontact
        projectdate
    */

    getProjects = async (offset, orderBy, order, showOpenOnly) => {
        this.validateDatabaseConnection()
        const LIMIT = 50
        const projectSortColumns = {
            projectid : ' ORDER BY p.projectID',
            projectclient : ' ORDER BY c.clientName',
            projectdescription : ' ORDER BY p.projectDescription',
            projectcontact : ' ORDER BY p.projectContact',
            projectdate : ' ORDER BY p.projectDate'
        }

        let queryBase = "SELECT p.*, c.clientName AS projectclient, TO_CHAR(p.projectDate, 'MM-DD-YYYY') AS projectDate FROM projects p INNER JOIN clients c ON p.clientID = c.clientID"

        if (showOpenOnly == 'true') {
            queryBase += " WHERE p.isClosed = false"
        }

        if (projectSortColumns[orderBy]) {
            queryBase += projectSortColumns[orderBy]
            if (order && order === 'desc'){
                queryBase += ' DESC'
            }
        }
       

        queryBase += " LIMIT $1 OFFSET $2;"
        const response =  await CnxPostgress.db.query( queryBase, [LIMIT, LIMIT * offset])
        return response
    }

    
    getProjectArrangements = async (id) => {
        this.validateDatabaseConnection()
        const response =  await CnxPostgress.db.query(`
            SELECT a.*,
            at.typeName AS typename
            FROM arrangements a 
            LEFT JOIN arrangementTypes at ON at.arrangementTypeID = a.arrangementType
            WHERE a.projectid = $1;`, [id])
        return response
    }
    
    getProjectFlowers = async (ids) => {
        this.validateDatabaseConnection()
        const response =  await CnxPostgress.db.query(`
        SELECT
            p.projectID,
            a.arrangementID,
            f.flowerID,
            f.flowerName,
            f.flowerImage,
            f.flowerColor,
            fxa.amount,
            FxI.unitPrice
            FROM projects p
            JOIN arrangements a ON p.projectID = a.projectID
            LEFT JOIN flowerXarrangement fxa ON a.arrangementID = fxa.arrangementID
            LEFT JOIN flowers f ON fxa.flowerID = f.flowerID 
            LEFT JOIN (
                SELECT fx.flowerID, MAX(fx.unitPrice) AS unitPrice
                FROM flowerXInvoice fx
                JOIN (
                    SELECT 
                        MAX(loadedDate) AS max_loaded_date,
                        flowerID
                    FROM flowerXInvoice
                    GROUP BY 
                        flowerID
                ) max_fx ON fx.flowerID = max_fx.flowerID AND fx.loadedDate = max_fx.max_loaded_date
                GROUP BY fx.flowerID
            ) FxI ON f.flowerID = FxI.flowerID
            WHERE p.projectID = ANY($1);`, [ids])
        return response
    }
    // -----------------------------------------------
    //                   FLOWERS
    // -----------------------------------------------

    addFlower = async (image, name, color) => {
        this.validateDatabaseConnection()
        await CnxPostgress.db.query("INSERT INTO flowers (flowerName, flowerImage, flowerColor) VALUES($1, $2, $3);", [name, image, color]);
        
    }

    getFlowersQuery = async (offset, query) => {
        this.validateDatabaseConnection()
        const LIMIT = 50
        const searchString = `%${query}%`
        let sqlQuery = "SELECT f.*, FxI.unitPrice FROM flowers f ";

        sqlQuery += `LEFT JOIN (
            SELECT fx.flowerID, MAX(fx.unitPrice) AS unitPrice
            FROM flowerXInvoice fx
            JOIN (
                SELECT 
                    MAX(loadedDate) AS max_loaded_date,
                    flowerID
                FROM flowerXInvoice
                GROUP BY 
                    flowerID
            ) max_fx ON fx.flowerID = max_fx.flowerID AND fx.loadedDate = max_fx.max_loaded_date
            GROUP BY fx.flowerID
        ) FxI ON f.flowerID = FxI.flowerID `

        let vals = []

        if (query) {
            sqlQuery += "WHERE f.flowername ILIKE $1 ";
            sqlQuery += "ORDER BY f.flowerName LIMIT $2 OFFSET $3;";
            vals = [searchString, LIMIT, LIMIT * offset]
        } else {
            sqlQuery += "ORDER BY f.flowerName LIMIT $1 OFFSET $2;";
            vals = [LIMIT, LIMIT * offset]
        }

        return await CnxPostgress.db.query(sqlQuery, vals);
    }

    // -----------------------------------------------
    //                   ARRANGEMENTS
    // -----------------------------------------------

    populateArrangement = async (arrangementID, flowerData) => {
        this.validateDatabaseConnection()
        // flowerData: [{flowerID, quantity}, {flowerID, quantity}...]
        await CnxPostgress.db.query("SELECT populateArrangements($1::INT, $2::JSONB[]);", [arrangementID, flowerData]);
    }

    getArrangementDataByID = async (id) => {
        this.validateDatabaseConnection()
        const response = await CnxPostgress.db.query(`
        SELECT 
            a.*,
            at.typeName,
            p.profitMargin
        FROM arrangements a
        LEFT JOIN arrangementTypes at ON at.arrangementTypeID = a.arrangementType
        LEFT JOIN projects p ON p.projectID = a.projectID
        WHERE arrangementID = $1;`, [id])
        return response
    }

    getFlowersByArrangementID = async(id) => {
        this.validateDatabaseConnection()
        const flowers = await CnxPostgress.db.query(`
        SELECT 
            FxA.flowerID,
            FxA.amount AS quantity,
            f.flowerName,
            f.flowerImage,
            f.flowerColor,
            FxI.unitPrice
        FROM flowerXarrangement FxA 
        LEFT JOIN flowers f ON FxA.flowerID = f.flowerID
        LEFT JOIN (
            SELECT fx.flowerID, MAX(fx.unitPrice) AS unitPrice
            FROM flowerXInvoice fx
            JOIN (
                SELECT 
                    MAX(loadedDate) AS max_loaded_date,
                    flowerID
                FROM flowerXInvoice
                GROUP BY 
                    flowerID
            ) max_fx ON fx.flowerID = max_fx.flowerID AND fx.loadedDate = max_fx.max_loaded_date
            GROUP BY fx.flowerID
        ) FxI ON f.flowerID = FxI.flowerID
        WHERE FxA.arrangementID = $1;`, [id])
        return flowers
    }

    editArrangement = async (id, arrangementData) => {
        this.validateDatabaseConnection()
        await CnxPostgress.db.query(`
        UPDATE arrangements 
        SET 
        arrangementType = $1,
        arrangementDescription = $2,
        clientCost = $3,
        arrangementQuantity = $4
        WHERE arrangementID = $5;`, 
        [arrangementData.arrangementType, arrangementData.arrangementDescription, arrangementData.clientCost, arrangementData.arrangementQuantity, id])

    }

    // -----------------------------------------------
    //                ARRANGEMENT TYPES
    // -----------------------------------------------

    loadArrangementType = async (typeName) => {
        this.validateDatabaseConnection()
        await CnxPostgress.db.query("INSERT INTO arrangementTypes (typeName) VALUES ($1);", [typeName])
    }

    getArrangementTypes = async () => {
        this.validateDatabaseConnection()
        const response = await CnxPostgress.db.query("SELECT * FROM arrangementTypes ORDER BY typename;")
        return response
    }

    // -----------------------------------------------
    //                  INVOICES
    // -----------------------------------------------

    addInvoice = async (invoiceData, invoiceFileLocation, InvoiceFlowerData, uploaderid) => {
        this.validateDatabaseConnection()
        await CnxPostgress.db.query('SELECT addInvoice($1::JSONB, $2::INT, $3::VARCHAR(255), $4::JSONB[]);', [invoiceData, uploaderid, invoiceFileLocation, InvoiceFlowerData])
    }

    getInvoiceData = async (id) => {
        this.validateDatabaseConnection()
        const respone = await CnxPostgress.db.query(`
        SELECT 
            i.invoiceid, 
            fv.vendorname, 
            i.invoiceamount, 
            i.invoiceNumber,
            u.email,
            i.fileLocation,
            TO_CHAR(i.invoicedate, 'MM-DD-YYYY') AS invoicedate
            FROM invoices i 
            LEFT JOIN flowerVendor fv ON fv.vendorID = i.vendorID
            LEFT JOIN users u ON u.userID = i.uploaderID
            WHERE i.invoiceid = $1;`, [id])
            return respone
    }



    getInvoices = async (offset,  orderBy, order, searchQuery, searchBy) => {
        this.validateDatabaseConnection()
        const LIMIT = 50

        const invoiceColumns = {
            invoiceid: " ORDER BY i.invoiceid",
            vendorname: " ORDER BY fv.vendorname",
            invoiceamount: " ORDER BY i.invoiceamount",
            invoicedate: " ORDER BY invoicedate",
            invoicenumber: " ORDER BY i.invoicenumber",
            hastransaction: " ORDER BY hastransaction"
        }

        const invoiceSearchColumns = {
            "invoiceid": " i.invoiceid",
            "invoicenumber": " i.invoicenumber",
        }

        let queryBase = `
        SELECT 
        i.invoiceid, 
        fv.vendorname, 
        i.invoiceamount, 
        i.invoiceNumber,
        u.email,
        i.fileLocation,
        TO_CHAR(i.invoicedate, 'MM-DD-YYYY') AS invoicedate,
        CASE 
            WHEN it.invoiceID IS NOT NULL THEN TRUE 
            ELSE FALSE 
        END AS hasTransaction
        FROM invoices i 
        LEFT JOIN flowerVendor fv ON fv.vendorID = i.vendorID
        LEFT JOIN users u ON u.userID = i.uploaderID
        LEFT JOIN (
            SELECT DISTINCT invoiceID FROM invoiceTransaction
        ) it ON it.invoiceID = i.invoiceID`
        
        const queryString = `%${searchQuery}%`
        if (invoiceSearchColumns[searchBy] && searchQuery) {
            queryBase += ' WHERE CAST(' + invoiceSearchColumns[searchBy] + ' AS TEXT) LIKE $1';
        }

        if (invoiceColumns[orderBy]) {
            queryBase += invoiceColumns[orderBy]
            if (order && order === 'desc'){
                queryBase += ' DESC'
            }
        }
        
        let queryValues = []
        if (invoiceSearchColumns[searchBy] && searchQuery) {
            queryBase += " LIMIT $2 OFFSET $3;"
            queryValues = [queryString, LIMIT, offset]
            
        }else {
            queryBase += " LIMIT $1 OFFSET $2;"
            queryValues = [LIMIT, offset]
        }

        const response = await CnxPostgress.db.query(queryBase, queryValues)

        return response
        
    }

    getProvidedProjects = async (invoiceID) => {
        this.validateDatabaseConnection()
        const respone = await CnxPostgress.db.query(`
        SELECT 
            projects.*, 
            clients.clientName AS projectclient, 
            TO_CHAR(projects.projectDate, 'MM-DD-YYYY') AS projectDate 
            FROM projects 
            INNER JOIN clients ON projects.clientID = clients.clientID 
            WHERE projects.projectID IN (
                SELECT DISTINCT projectID 
                FROM flowerXInvoice 
                WHERE invoiceID = $1);`
        , [invoiceID])
        return respone
    }

    getFlowersXInvoice = async (invoiceid) => {
        this.validateDatabaseConnection()
        const respone = await CnxPostgress.db.query(
            `SELECT
                f.flowerid,
                f.flowername,
                FxI.unitPrice,
                FxI.numStems
                FROM flowerXInvoice FxI
                LEFT JOIN flowers f on f.flowerID = FxI.flowerID
                WHERE FxI.invoiceID = $1;`, [invoiceid])

        return respone
    }

    linkBaknTransaction = async (bankTransactionData, selectedInvoices) => {
        this.validateDatabaseConnection()
        await CnxPostgress.db.query(`SELECT linkBankTx($1::VARCHAR(255), $2::INT[])`, [bankTransactionData, selectedInvoices])
    }

    getInvoiceBankTransactions = async (id) => {
        this.validateDatabaseConnection()
        return await CnxPostgress.db.query(`SELECT * FROM invoiceTransaction WHERE invoiceID = $1`, [id])
    }
}

export default ModelPostgres