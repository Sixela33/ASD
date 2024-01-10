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
        
        const result = await CnxPostgress.db.query('SELECT r.roleName FROM roleXuser rxu JOIN userRole r ON rxu.roleID = r.roleID WHERE rxu.userID = $1;', [userID])

        const roles = result.rows.map(row => row.rolename);
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

    createClient = async (clientName, clientEmail) => {
        
        await CnxPostgress.db.query('INSERT INTO clients (clientname, clientemail) VALUES ($1, $2);', [clientName, clientEmail])

    }

    // -----------------------------------------------
    //                   PROJECTS
    // -----------------------------------------------

    createProject = async (staffBudget, projectContact, projectDate, projectDescription, projectClient, profitMargin, creatorid, arrangements) => {
        
        await CnxPostgress.db.query("SELECT createProject($1::DATE, $2::VARCHAR, $3::VARCHAR, $4::FLOAT, $5::FLOAT, $6::VARCHAR, $7::INT, $8::JSONB[]);", [projectDate, projectDescription, projectContact, staffBudget, profitMargin, projectClient, creatorid, arrangements]);
    }

    // -----------------------------------------------
    //                   FLOWERS
    // -----------------------------------------------

    addFlower = async (image, name, color) => {
        
        await CnxPostgress.db.query("INSERT INTO flowers (flowerName, flowerImage, flowerColor) VALUES($1, $2, $3);", [name, image, color]);
        
    }

    getFlowersQuery = async (offset, query) => {
        const LIMIT = 25
        const searchString = `%${query}%`
    
        return await CnxPostgress.db.query("SELECT * FROM flowers WHERE flowername ILIKE $1 LIMIT $2 OFFSET $3;", [searchString, LIMIT, LIMIT * offset]);
    };

    getFlowers = async (offset) => {
        const LIMIT = 25

        return await CnxPostgress.db.query("SELECT * FROM flowers LIMIT $1 OFFSET $2;", [LIMIT, LIMIT * offset]);
    };
}

export default ModelPostgres