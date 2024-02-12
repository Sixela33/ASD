import CnxPostgress from "../CnxPostgress.js";

class ModelPostgres {

    constructor () {
        if (!CnxPostgress.connection) throw new Error("The databse connection has not been established")
    }

    runQuery = async (query) => {
        await CnxPostgress.db.query(query)

    }

    // -----------------------------------------------
    //                    USERS
    // -----------------------------------------------

    getUserByEmail = async (email) => {
        return await CnxPostgress.db.query('SELECT * FROM users WHERE email = $1;', [email])        
    }

    getUserById = async (userID) => {
        return await CnxPostgress.db.query('SELECT * FROM users WHERE userid = $1;', [userID])        
    }

    getUserByRefreshToken = async (refreshToken) => {
        
        return await CnxPostgress.db.query('SELECT * FROM users WHERE refreshtoken = $1;', [refreshToken])     
    }

    setRefreshToken = async (userID, refreshToken) => {
        return await CnxPostgress.db.query('UPDATE users SET refreshtoken = $1 WHERE userid = $2;', [refreshToken, userID])     
    }

    getUsers = async () => {
        
        return await CnxPostgress.db.query("SELECT * FROM users;")

    }

    registerUser = async (username, email, passHash) => {
        // await CnxPostgress.db.query('INSERT INTO users (username, email, passhash) VALUES ($1, $2, $3);', [username, email, passHash])
        // this funciont creates the user and asigns it to the "User" role
        await CnxPostgress.db.query('SELECT createUser($1, $2, $3)', [username, email, passHash])
                
    }

    changePassword = async (userID, newPassHash) => {
        await CnxPostgress.db.query('UPDATE users SET passhash = $1 WHERE userid = $2;', [newPassHash, userID])
    }

    // -----------------------------------------------
    //                USER PERMISSIONS
    // -----------------------------------------------

    createRole = async (roleName) => {
        await CnxPostgress.db.query('INSERT INTO userrole (rolename) VALUES ($1);', [roleName])
    }

    getAllRoles = async () => {
        return await CnxPostgress.db.query('SELECT roleid, rolename FROM userrole')
    }

    getRoleByID = async (roleid) => {
        return await CnxPostgress.db.query('SELECT * FROM userrole WHERE roleid = $1;', [roleid])
    } 

    addRoleToUser = async (roleID, userID) => {
        await CnxPostgress.db.query('INSERT INTO roleXuser (userid, roleid) VALUES ($1, $2);', [userID, roleID])
    }

    getUserRoles = async (userID) => {
        
        const response = await CnxPostgress.db.query('SELECT r.roleName FROM roleXuser rxu JOIN userRole r ON rxu.roleID = r.roleID WHERE rxu.userID = $1;', [userID])

        const roles = response.rows.map(row => row.rolename);
        return roles;
    
    }

    removeRoleUser = async (roleID, userID) => {
        return await CnxPostgress.db.query('DELETE FROM roleXuser WHERE roleid = $1 AND userid = $2;', [roleID, userID])
    }

    userHasRole = async (roleID, userID) => {
        return await CnxPostgress.db.query('SELECT * FROM roleXuser WHERE roleid = $1 AND userid = $2;', [roleID, userID])
    }

    // -----------------------------------------------
    //                    CLIENTS
    // -----------------------------------------------

    createClient = async (clientName) => {

        await CnxPostgress.db.query('INSERT INTO clients (clientname) VALUES ($1);', [clientName])

    }

    getClients = async () => {
        return CnxPostgress.db.query('SELECT * FROM clients ORDER BY clientname;')
    }

    // -----------------------------------------------
    //                    VENDORS
    // -----------------------------------------------

    getVendors = async () => {
        return await CnxPostgress.db.query('SELECT vendorid, vendorname FROM flowerVendor ORDER BY vendorname;')
        //return await CnxPostgress.db.query('SELECT vendorid, vendorname FROM flowerVendor LIMIT $1 OFFSET $2 ORDER BY vendorname;')
    }

    createVendor = async (vendorName) => {

        await CnxPostgress.db.query('INSERT INTO flowerVendor (vendorName) VALUES ($1);', [vendorName])

    }

    // -----------------------------------------------
    //                    CLIENTS
    // -----------------------------------------------

    createClients = async (clientName) => {
        await CnxPostgress.db.query('INSERT INTO clients (clientName) VALUES ($1); ', [clientName])
    }

    // -----------------------------------------------
    //                   PROJECTS
    // -----------------------------------------------

    createProject = async (staffBudget, projectContact, projectDate, projectDescription, projectClientID, profitMargin, creatorid, arrangements) => {
        // arrangements: [{arrangementType, arrangementDescription, flowerBudget, arrangementQuantity}, ...] VIEW REFERENCE IN PROJECT ARRANGEMENT VALIDATIONS
 
        await CnxPostgress.db.query("SELECT createProject($1::DATE, $2::VARCHAR, $3::VARCHAR, $4::FLOAT, $5::FLOAT, $6::INT, $7::INT, $8::JSONB[]);", [projectDate, projectDescription, projectContact, staffBudget, profitMargin, projectClientID, creatorid, arrangements]);
    }

    getProjectByID = async (id) => {
        return await CnxPostgress.db.query(
            "SELECT projects.*, clients.clientName AS projectclient, TO_CHAR(projects.projectDate, 'MM-DD-YYYY') AS projectDate FROM projects INNER JOIN clients ON projects.clientID = clients.clientID WHERE projects.projectID = $1;",
            [id]
        );
    }

    getManyProjectsByID = async (ids) => {
        return await CnxPostgress.db.query(
            "SELECT projects.*, clients.clientName AS projectclient, TO_CHAR(projects.projectDate, 'MM-DD-YYYY') AS projectDate FROM projects INNER JOIN clients ON projects.clientID = clients.clientID WHERE projects.projectID IN (SELECT * FROM UNNEST($1::int[]));",
            [ids]
        );
    }

    getProjects = async (offset) => {
        const LIMIT = 50
        const response =  await CnxPostgress.db.query(
            "SELECT projects.*, clients.clientName AS projectclient, TO_CHAR(projects.projectDate, 'MM-DD-YYYY') AS projectDate FROM projects INNER JOIN clients ON projects.clientID = clients.clientID LIMIT $1 OFFSET $2;",
            [LIMIT, LIMIT * offset]
        )
        return response
    }

    
    getProjectArrangements = async (id) => {
        const response =  await CnxPostgress.db.query(`SELECT * FROM arrangements WHERE projectid = $1;`, [id])
        return response
        
    }
    
    getProjectFlowers = async (ids) => {
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
        
        await CnxPostgress.db.query("INSERT INTO flowers (flowerName, flowerImage, flowerColor) VALUES($1, $2, $3);", [name, image, color]);
        
    }

    getFlowersQuery = async (offset, query) => {
        const LIMIT = 50
        const searchString = `%${query}%`
    
        return await CnxPostgress.db.query("SELECT * FROM flowers WHERE flowername ILIKE $1 ORDER BY flowerName LIMIT $2 OFFSET $3;", [searchString, LIMIT, LIMIT * offset]);
    };

    getFlowers = async (offset) => {
        const LIMIT = 50

        return await CnxPostgress.db.query("SELECT * FROM flowers ORDER BY flowerName LIMIT $1 OFFSET $2;", [LIMIT, LIMIT * offset]);
    };

    // -----------------------------------------------
    //                   ARRANGEMENTS
    // -----------------------------------------------

    populateArrangements = async (arrangementID, flowerData) => {
        // flowerData: [{flowerID, quantity}, {flowerID, quantity}...]
        await CnxPostgress.db.query("SELECT populateArrangements($1::INT, $2::JSONB[]);", [arrangementID, flowerData]);
    }

    getArrangementDataByID = async (id) => {
        const response = await CnxPostgress.db.query(`
        SELECT 
            a.*,
            at.typeName
        FROM arrangements a
        LEFT JOIN arrangementTypes at ON at.arrangementTypeID = a.arrangementType
        WHERE arrangementID = $1;`, [id])
        return response
    }

    getFlowersByArrangementID = async(id) => {
        const flowers = await CnxPostgress.db.query(`
        SELECT 
            FxA.flowerID,
            FxA.amount,
            f.flowerName,
            f.flowerImage,
            f.flowerColor
        FROM flowerXarrangement FxA 
        LEFT JOIN flowers f ON FxA.flowerID = f.flowerID
        WHERE FxA.arrangementID = $1;`, [id])
        return flowers
    }

    // -----------------------------------------------
    //                ARRANGEMENT TYPES
    // -----------------------------------------------

    loadArrangementType = async (typeName) => {
        await CnxPostgress.db.query("INSERT INTO arrangementTypes (typeName) VALUES ($1);", [typeName])
    }

    getArrangementTypes = async () => {
        const response = await CnxPostgress.db.query("SELECT * FROM arrangementTypes ORDER BY typename;")
        return response
    }

    // -----------------------------------------------
    //                  INVOICES
    // -----------------------------------------------

    addInvoice = async (invoiceData, invoiceFileLocation, InvoiceFlowerData, uploaderid) => {
        await CnxPostgress.db.query('SELECT addInvoice($1::JSONB, $2::INT, $3::VARCHAR(255), $4::JSONB[]);', [invoiceData, uploaderid, invoiceFileLocation, InvoiceFlowerData])
    }

    getInvoices = async (offset, query) => {
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
            LEFT JOIN users u ON u.userID = i.uploaderID;`)
        return respone
    }

    getProvidedProjects = async (invoiceID) => {
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
        const respone = await CnxPostgress.db.query(
            `SELECT
                f.flowername,
                FxI.projectID,
                FxI.unitPrice,
                FxI.numStems
                FROM flowerXInvoice FxI
                LEFT JOIN flowers f on f.flowerID = FxI.flowerID
                WHERE FxI.invoiceID = $1;`, [invoiceid])

        return respone
    }
}

export default ModelPostgres