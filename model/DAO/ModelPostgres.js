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
            "SELECT projects.*, clients.clientName AS projectclient FROM projects INNER JOIN clients ON projects.clientID = clients.clientID WHERE projects.projectID = $1;",
            [id]
        );
    }

    getManyProjectsByID = async (ids) => {
        return await CnxPostgress.db.query(
            "SELECT projects.*, clients.clientName AS projectclient FROM projects INNER JOIN clients ON projects.clientID = clients.clientID WHERE projects.projectID IN (SELECT * FROM UNNEST($1::int[]));",
            [ids]
        );
    }

    getProjects = async (offset) => {
        const LIMIT = 50
        const response =  await CnxPostgress.db.query(
            "SELECT projects.*, clients.clientName AS projectclient FROM projects INNER JOIN clients ON projects.clientID = clients.clientID LIMIT $1 OFFSET $2;",
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
        fxa.amount
        FROM projects p
        JOIN arrangements a ON p.projectID = a.projectID
        LEFT JOIN flowerXarrangement fxa ON a.arrangementID = fxa.arrangementID
        LEFT JOIN flowers f ON fxa.flowerID = f.flowerID
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

    addInvoice = async (data) => {
        
    }
}

export default ModelPostgres