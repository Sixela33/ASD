import ROLES_LIST from "../../config/rolesList.js";
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
        return await CnxPostgress.db.query(`
        SELECT
            u.email, 
            ur.roleCode as permissionlevel, 
            u.userid, 
            u.username,
            u.picture
        FROM users u LEFT JOIN userRole ur ON u.permissionLevel = ur.roleID 
        WHERE email = $1;`, [email])        
    }

    getUserByRefreshToken = async (refreshToken) => {
        this.validateDatabaseConnection()
        return await CnxPostgress.db.query(`
            SELECT 
                u.email, 
                ur.roleCode as permissionlevel, 
                u.userid, 
                u.username,
                u.picture
            FROM users u LEFT JOIN userRole ur ON u.permissionLevel = ur.roleID 
            WHERE u.refreshtoken = $1;`, [refreshToken])     
    }

    setRefreshToken = async (userID, refreshToken) => {
        this.validateDatabaseConnection()
        return await CnxPostgress.db.query('UPDATE users SET refreshtoken = $1 WHERE userid = $2;', [refreshToken, userID])     
    }

    getUsers = async (searchEmail, offset) => {
        this.validateDatabaseConnection()

        const LIMIT = 50

        let baseQuery = `
            SELECT 
                u.email, 
                ur.roleCode as permissionlevel, 
                ur.roleName,
                u.userid, 
                u.username
            FROM users u LEFT JOIN userRole ur ON u.permissionLevel = ur.roleID`

            const queryParams = []
            let queryConditions = []
    
            if(searchEmail && searchEmail != '') {
                queryConditions.push(`u.email ILIKE $${queryParams.length + 1}`)
                queryParams.push(`%${searchEmail}%`)
            }  
    
            if (queryConditions.length > 0) {
                baseQuery += ' WHERE ' + queryConditions.join(' AND ')
            }

            baseQuery += ' ORDER BY u.userid'
           
            baseQuery += ` LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2};`

            queryParams.push(LIMIT, offset*LIMIT)
    
            return  await CnxPostgress.db.query( baseQuery, queryParams)
    }

    registerUser = async (email, username, picture) => {
        this.validateDatabaseConnection()

        await CnxPostgress.db.query(`
        INSERT INTO users (username, email, picture, permissionLevel)
        VALUES ($1, $2, $3, (SELECT roleID FROM userRole WHERE roleCode = $4));`, [username, email, picture, ROLES_LIST['Inactive']])    
    }

    // -----------------------------------------------
    //                USER PERMISSIONS
    // -----------------------------------------------

    
    getUserPermissionLevel = async (userID) => {
        this.validateDatabaseConnection()
        const res = await CnxPostgress.db.query(`
            SELECT 
                ur.roleCode as permissionlevel
            FROM users u LEFT JOIN userRole ur ON u.permissionLevel = ur.roleID
            WHERE u.userID = $1;`, [userID])

        return res.rows.map(p => p.permissionlevel)
    }

    changeUserPermissions = async (newRoleid, userid) => {
        this.validateDatabaseConnection()
        await CnxPostgress.db.query('UPDATE users SET permissionLevel = $1 WHERE userid = $2;', [newRoleid, userid])
    }

    setUserPermissionLevel = async (userID, permissionLevel) => {
        this.validateDatabaseConnection()
        await CnxPostgress.db.query(`UPDATE users SET permissionLevel = (SELECT roleID FROM userRole WHERE roleCode = $1) WHERE userid = $2;`, [permissionLevel, userID])
    }

    createRole = async (roleName, roleCode) => {
        this.validateDatabaseConnection()
        await CnxPostgress.db.query('INSERT INTO userrole (rolename, roleCode) VALUES ($1, $2);', [roleName, roleCode])
    }

    getAllRoles = async () => {
        this.validateDatabaseConnection()
        return await CnxPostgress.db.query('SELECT roleName, roleid, roleCode AS permissionlevel FROM userRole')
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
        return CnxPostgress.db.query('SELECT clientID, clientName FROM clients ORDER BY clientname;')
    }

    editClient = async (clientid, clientname) => {
        this.validateDatabaseConnection()
        return CnxPostgress.db.query('UPDATE clients SET clientName = $1 WHERE clientID=$2', [clientname, clientid])
    }

    // -----------------------------------------------
    //                    VENDORS
    // -----------------------------------------------

    getVendors = async () => {
        this.validateDatabaseConnection()
        return await CnxPostgress.db.query('SELECT vendorid, vendorname FROM flowerVendor ORDER BY vendorname;')
        //return await CnxPostgress.db.query('SELECT vendorid, vendorname FROM flowerVendor LIMIT $1 OFFSET $2 ORDER BY vendorname;')
    }

    addVender = async (vendorName) => {
        this.validateDatabaseConnection()
        await CnxPostgress.db.query('INSERT INTO flowerVendor (vendorName) VALUES ($1);', [vendorName])

    }

    editVendor = async (vendorname, vendorid) => {
        this.validateDatabaseConnection()
        await CnxPostgress.db.query('UPDATE flowerVendor SET vendorName=$1 WHERE vendorID=$2;', [vendorname, vendorid])
    }

    removeVendor = async (id) => {
        this.validateDatabaseConnection()
        await CnxPostgress.db.query("UPDATE flowerVendor SET isActive=false WHERE vendorID=$1;", [id])
    }

    reactivateVendor = async (id) => {
        this.validateDatabaseConnection()
        await CnxPostgress.db.query("UPDATE flowerVendor SET isActive=true WHERE vendorID=$1;", [id])
    }  

    // -----------------------------------------------
    //                   PROJECTS
    // -----------------------------------------------

    createProject = async (staffBudget, projectContact, projectDate, projectDescription, projectClientID, profitMargin, creatorid, arrangements, extras, isRecurrent) => {
        this.validateDatabaseConnection()
        const response = await CnxPostgress.db.query("CALL createProject($1::DATE, $2::VARCHAR, $3::VARCHAR, $4::FLOAT, $5::FLOAT, $6::INT, $7::INT, $8::JSONB[], $9::JSONB[], $10::BOOLEAN);",
        [projectDate, projectDescription, projectContact, staffBudget, profitMargin, projectClientID, creatorid, arrangements, extras, isRecurrent]);
        return response.rows[0]
    }

    deleteProject = async (id) => {
        this.validateDatabaseConnection()
        try {
            await CnxPostgress.db.query("DELETE FROM projects WHERE projectID = $1;", [id])
        } catch (error) {
            if (error.code == 23503) {
                throw {message: "This project is linked to invoices and cannot be removed.", status: 400}
            }
            else throw error
        }
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
            `SELECT 
                projects.projectid, 
                projects.clientid, 
                projects.projectdescription, 
                projects.projectcontact, 
                projects.profitmargin, 
                projects.staffbudget, 
                projects.creatorid, 
                projects.isclosed, 
                projects.clientID,
                projects.isRecurrent,
                clients.clientName AS projectclient, 
                TO_CHAR(projects.projectDate, 'MM-DD-YYYY') AS projectDate 
                FROM projects INNER JOIN clients ON projects.clientID = clients.clientID 
                WHERE projects.projectID = $1;`,
                [id]
        );
    }

    getManyProjectsByID = async (ids) => {
        this.validateDatabaseConnection()
        return await CnxPostgress.db.query(
            `SELECT 
                projects.projectid, 
                projects.clientid, 
                projects.projectdate, 
                projects.projectdescription, 
                projects.projectcontact, 
                clients.clientName AS projectclient, 
                TO_CHAR(projects.projectDate, 'MM-DD-YYYY') AS projectDate 
                FROM projects INNER JOIN clients ON projects.clientID = clients.clientID 
                WHERE projects.projectID IN (SELECT * FROM UNNEST($1::int[]));`,
            [ids]
        );
    }

    getProjects = async (offset, orderBy, order, showOpenOnly, searchByID, searchByContact, searchByDescription, rows, searchByClient) => {
        this.validateDatabaseConnection()
        const LIMIT = rows || 50
        const projectSortColumns = {
            projectid : ' ORDER BY p.projectID',
            projectclient : ' ORDER BY c.clientName',
            projectdescription : ' ORDER BY p.projectDescription',
            projectcontact : ' ORDER BY p.projectContact',
            projectdate : ' ORDER BY p.projectDate',
            projectstatus: ' ORDER BY projectstatus'
        }

        let queryBase = `
        SELECT 
            p.projectid,
            p.clientid,
            p.projectdescription,
            p.projectcontact,
            p.isclosed, 
            c.clientName AS projectclient, 
            TO_CHAR(p.projectDate, 'MM-DD-YYYY') AS projectDate,
            CASE
                WHEN num_arrangements IS NULL THEN 0
                WHEN num_arrangements_with_no_flowers > 0 THEN 1
                ELSE 2
            END AS projectStatus
        FROM 
            projects p 
        INNER JOIN 
            clients c ON p.clientID = c.clientID
        LEFT JOIN (
            SELECT 
                projectID,
                COUNT(*) AS num_arrangements,
                COUNT(CASE WHEN arrangementID NOT IN (SELECT arrangementID FROM flowerXarrangement) THEN 1 END) AS num_arrangements_with_no_flowers
            FROM 
                arrangements
            GROUP BY 
                projectID
        ) AS arr_counts ON p.projectID = arr_counts.projectID`

        const queryParams = []
        let queryConditions = []

        if (showOpenOnly == 'true') {
            queryConditions.push('p.isClosed = false')
        }
        
        if(searchByID && searchByID != '') {
            queryConditions.push(`p.projectid = $${queryParams.length + 1}`)
            queryParams.push(searchByID)
        }
        
        if(searchByContact && searchByContact != '') {
            queryConditions.push(`p.projectcontact ILIKE $${queryParams.length + 1}`)
            queryParams.push(`%${searchByContact}%`)
        }

        if(searchByDescription && searchByDescription != '') {
            queryConditions.push(`p.projectdescription ILIKE $${queryParams.length + 1}`)
            queryParams.push(`%${searchByDescription}%`)
        }

        if(searchByClient && searchByClient != '') {
            queryConditions.push(`p.clientid = $${queryParams.length + 1}`)
            queryParams.push(searchByClient)
        }
    

        if (queryConditions.length > 0) {
            queryBase += ' WHERE ' + queryConditions.join(' AND ')
        }

        if (projectSortColumns[orderBy]) {
            queryBase += projectSortColumns[orderBy]
            if (order && order === 'desc'){
                queryBase += ' DESC'
            }
        }
       
        queryBase += ` LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2};`

        queryParams.push(LIMIT, offset*LIMIT)

        const response =  await CnxPostgress.db.query( queryBase, queryParams)
        return response
    }
    
    getProjectArrangements = async (id) => {
        this.validateDatabaseConnection()
        const response =  await CnxPostgress.db.query(`
            SELECT 
            a.arrangementid,
            a.projectid,
            a.arrangementdescription,
            a.clientcost,
            a.arrangementquantity,
            a.designerid,
            a.arrangementtype,
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

    getProjectFlowersForPpt = async (id) => {
        this.validateDatabaseConnection()
        return await CnxPostgress.db.query(`
        SELECT
            f.flowerName,
            f.flowerColor,
            f.flowerImage
            FROM projects p
            JOIN arrangements a ON p.projectID = a.projectID
            LEFT JOIN flowerXarrangement fxa ON a.arrangementID = fxa.arrangementID
            LEFT JOIN flowers f ON fxa.flowerID = f.flowerID 
            WHERE p.projectID = $1;`, [id])
    }

    addArrangementToProject = async (id, arrangementData) => {
        this.validateDatabaseConnection();
        const result = await CnxPostgress.db.query(`
            INSERT INTO arrangements (projectID, arrangementType, arrangementDescription, clientCost, arrangementQuantity)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING arrangementID;`, 
            [id, arrangementData.arrangementType, arrangementData.arrangementDescription, arrangementData.clientCost, arrangementData.arrangementQuantity]);
        
        const arrangementID = result.rows[0].arrangementID;
        
        return arrangementID;
    }

    editProjectData = async (id, projectData) => {
        this.validateDatabaseConnection()
        await CnxPostgress.db.query(`
        UPDATE projects SET 
            clientID = $1,
            projectDate = $2,
            projectDescription = $3,
            projectContact = $4,
            staffBudget = $5,
            profitMargin = $6,
            lastEdit = CURRENT_TIMESTAMP
        WHERE projects.projectID = $7
        `, [projectData.clientid, projectData.projectDate, projectData.projectDescription, projectData.projectContact, projectData.staffBudget, projectData.profitMargin, id]
        )
    }

    changeFlowerInProject = async (projectid, previousflowerid, newflowerid) => {
        this.validateDatabaseConnection()
        await CnxPostgress.db.query(`CALL change_flower_in_project($1::INT, $2::INT, $3::INT);`, [projectid, previousflowerid, newflowerid])
    }

    makeProjectCheckpoint = async (projectData, totalExtrasCost, totalArrangementsCost) => {
        this.validateDatabaseConnection()
        
        const date = new Date()
        await CnxPostgress.db.query(`
        INSERT INTO recurrentProjectCheckpoint (
            projectID,
            checkpointDate,
            totalExtrasCost,
            totalArrangementsCost,
            profitMargin,
            staffBudget)
        VALUES ($1, $2, $3, $4, $5, $6);`, 
        [projectData.projectid, date, totalExtrasCost, totalArrangementsCost, projectData.profitmargin, projectData.staffbudget])
    }


    getRecurrentProjects = async () => {
        this.validateDatabaseConnection()
        return await CnxPostgress.db.query(`SELECT projectID FROM projects WHERE isRecurrent = true AND isClosed = false;`)
    }

    getIsProjectClosed = async (id) => {
        this.validateDatabaseConnection()
        const res = await CnxPostgress.db.query('SELECT isClosed FROM projects WHERE projectID = $1;', [id])
        return res.rows
    }

    // -----------------------------------------------
    //                   FLOWERS
    // -----------------------------------------------

    addFlower = async (image, name, color) => {
        this.validateDatabaseConnection()
        await CnxPostgress.db.query("INSERT INTO flowers (flowerName, flowerImage, flowerColor) VALUES($1, $2, $3);", [name, image, color]);
        
    }
    
    editFlower = async (name, color, id, filepath) => {
        this.validateDatabaseConnection()
        await CnxPostgress.db.query("UPDATE flowers SET flowerName=$1, flowerImage=$2, flowerColor=$3 WHERE flowerID=$4;", [name, filepath, color, id])
    }

    getFlowerData = async (id) => {
        this.validateDatabaseConnection()
        return await CnxPostgress.db.query("SELECT flowerid, flowername, flowerimage, flowercolor FROM flowers WHERE flowerID = $1;", [id])
    }

    getIncompleteFlowers = async () => {
        this.validateDatabaseConnection()
        return await CnxPostgress.db.query(`
        SELECT 
            flowerid, 
            flowername, 
            flowerimage, 
            flowercolor 
        FROM flowers 
        WHERE 
            flowerID IS NULL 
            OR 
            flowername IS NULL 
            OR 
            flowerimage IS NULL
            OR
            flowercolor IS NULL;`)
    }

    getFlowerPrices = async (id) => {
        this.validateDatabaseConnection()
        return await CnxPostgress.db.query(`SELECT 
        fxi.unitPrice, 
        
        TO_CHAR(i.createdAt , 'MM-DD-YYYY') AS createdAt
        FROM flowerXInvoice fxi 
        LEFT JOIN invoices i ON fxi.invoiceID = i.invoiceID
        WHERE fxi.flowerID = $1;`, [id])
    }

    getFlowersQuery = async (offset, query, filterByColor) => {
        this.validateDatabaseConnection()
        const LIMIT = 50
        let sqlQuery = `
        SELECT 
            f.flowerid, 
            f.flowername, 
            f.flowerimage, 
            f.flowercolor, 
            FxI.unitPrice 
        FROM flowers f
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
        ) FxI ON f.flowerID = FxI.flowerID `

        const queryParams = []
        let queryConditions = []

        if(query) {
            queryConditions.push(`f.flowername ILIKE $${queryParams.length + 1}`)
            queryParams.push(`%${query}%`)
        }
    

        if (filterByColor) {
            queryConditions.push(`f.flowercolor ILIKE $${queryParams.length + 1}`)
            queryParams.push(`%${filterByColor}%`)
        }

        if (queryConditions.length > 0) {
            sqlQuery += ' WHERE ' + queryConditions.join(' AND ')
        }

        sqlQuery += `ORDER BY f.flowerName LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2};`
        queryParams.push(LIMIT, offset*LIMIT)

        return await CnxPostgress.db.query(sqlQuery, queryParams);
    }

    getUniqueFlowerColors = async () => {
        this.validateDatabaseConnection()
        return CnxPostgress.db.query('SELECT DISTINCT flowercolor FROM flowers')
    }

    // -----------------------------------------------
    //                 ARRANGEMENTS
    // -----------------------------------------------

    populateArrangement = async (arrangementID, flowerData) => {
        this.validateDatabaseConnection()
        await CnxPostgress.db.query("CALL populateArrangements($1::INT, $2::JSONB[]);", [arrangementID, flowerData]);
    }

    getArrangementDataByID = async (id) => {
        this.validateDatabaseConnection()
        const response = await CnxPostgress.db.query(`
        SELECT 
            a.arrangementid,
            a.projectid,
            a.arrangementtype,
            a.arrangementdescription,
            a.clientcost,
            a.arrangementquantity,
            a.designerid,
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

    deleteArrangement = async (id) => {
        this.validateDatabaseConnection()
        await CnxPostgress.db.query(`CALL deleteArrangement($1::INT);`,[id])
    }

    isArrangementsProjectClosed = async (arrangementID) => {
        this.validateDatabaseConnection()
        const res = await CnxPostgress.db.query(`
        SELECT p.isClosed 
        FROM arrangements a 
        RIGHT JOIN projects p ON a.projectID = p.projectID
        WHERE a.arrangementID = $1;
        `, [arrangementID])
        return res.rows
    }

    // -----------------------------------------------
    //              ARRANGEMENT TYPES
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
        const response = await CnxPostgress.db.query('CALL addInvoice($1::JSONB, $2::INT, $3::VARCHAR(255), $4::JSONB[]);', [invoiceData, uploaderid, invoiceFileLocation, InvoiceFlowerData])
        return response.rows[0]
    }

    addIncompleteInvoice = async (invoiceData, invoiceFileLocation, uploaderid) => {
        this.validateDatabaseConnection()
        await CnxPostgress.db.query(`
            INSERT INTO invoices (
                fileLocation, 
                invoiceAmount, 
                uploaderID, 
                vendorID, 
                invoiceDate, 
                invoiceNumber,
                invoiceTax)
            VALUES ($1, $2, $3, $4, $5, $6, $7);`, 
            [invoiceFileLocation, invoiceData.invoiceAmount, uploaderid, invoiceData.vendor, invoiceData.dueDate, invoiceData.invoiceNumber, invoiceData.invoiceTax])
    }

    editIncompleteInvoice = async (invoiceData, invoiceFileLocation, uploaderid, invoiceid) => {
        this.validateDatabaseConnection();
        await CnxPostgress.db.query(`
            UPDATE invoices 
            SET 
                fileLocation = $1,
                invoiceAmount = $2,
                uploaderID = $3,
                vendorID = $4,
                invoiceDate = $5,
                invoiceNumber = $6,
                invoiceTax = $7
            WHERE 
                invoiceID = $8;`, 
            [invoiceFileLocation, invoiceData.invoiceAmount, uploaderid, invoiceData.vendor, invoiceData.dueDate, invoiceData.invoiceNumber, invoiceData.invoiceTax, invoiceid]);
    }

    editInvoice = async (invoiceData, invoiceFileLocation, InvoiceFlowerData, editorID) => {
        this.validateDatabaseConnection()
        await CnxPostgress.db.query('CALL editInvoice($1::JSONB, $2::INT, $3::VARCHAR(255), $4::JSONB[]);', [invoiceData, editorID, invoiceFileLocation, InvoiceFlowerData])
    }

    getInvoiceFileLocation = async (invoiceid) =>{
        this.validateDatabaseConnection()
        return await CnxPostgress.db.query('SELECT fileLocation FROM invoices WHERE invoiceID = $1;', [invoiceid])
    }

    getInvoiceData = async (id) => {
        this.validateDatabaseConnection()
        const respone = await CnxPostgress.db.query(`
        SELECT 
            i.invoiceid, 
            fv.vendorname, 
            i.vendorID,
            i.invoiceamount, 
            i.invoiceNumber,
            u.email,
            i.fileLocation,
            i.invoiceTax,
            TO_CHAR(i.invoicedate, 'YYYY-MM-DD') AS invoicedate
            FROM invoices i 
            LEFT JOIN flowerVendor fv ON fv.vendorID = i.vendorID
            LEFT JOIN users u ON u.userID = i.uploaderID
            WHERE i.invoiceid = $1;`, [id])
            return respone
    }


    getInvoiceProjects = async (invoiceID) => {
        this.validateDatabaseConnection()
        const respone = await CnxPostgress.db.query(`SELECT DISTINCT projectID FROM flowerXInvoice WHERE invoiceID = $1;`, [invoiceID])
        return respone
    }

    getInvoices = async (offset,  orderBy, order, searchQuery, searchBy, specificVendor, onlyMissing, rows) => {
        this.validateDatabaseConnection()
        const LIMIT = rows || 50

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
    
        
        const queryParams = []
        let queryConditions = []

        if(onlyMissing == 'true') {
            queryBase += " LEFT JOIN (SELECT DISTINCT invoiceID FROM flowerXInvoice) fxi ON fxi.invoiceID = i.invoiceID"
            queryConditions.push('fxi.invoiceID IS NULL ')
        }

        // Agregar filtro para el vendor específico si se proporciona
        if (specificVendor) {
            queryConditions.push('i.vendorID = $1')
            queryParams.push(specificVendor)
        }
    
        const queryString = `%${searchQuery}%`
        if (invoiceSearchColumns[searchBy] && searchQuery) {
            queryConditions.push(`CAST(${invoiceSearchColumns[searchBy]} AS TEXT) LIKE $${queryParams.length + 1}`)
            queryParams.push(queryString)
        }
    
        if (queryConditions.length > 0) {
            queryBase += ' WHERE ' + queryConditions.join(' AND ')
        }

        if (invoiceColumns[orderBy]) {
            queryBase += invoiceColumns[orderBy]
            if (order && order === 'desc'){
                queryBase += ' DESC'
            }
        }
        
        queryBase += ` LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2};`
        queryParams.push(LIMIT, offset*LIMIT)

        const response = await CnxPostgress.db.query(queryBase, queryParams)

        return response
        
    }

    getProvidedProjects = async (invoiceID) => {
        this.validateDatabaseConnection()
        const respone = await CnxPostgress.db.query(`
        SELECT 
            p.projectcontact, 
            p.projectdate, 
            p.projectdescription,
            clients.clientName AS projectclient, 
            TO_CHAR(p.projectDate, 'MM-DD-YYYY') AS projectDate 
            FROM projects p
            INNER JOIN clients ON p.clientID = clients.clientID 
            WHERE p.projectID IN (
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
                FxI.numStems,
                p.projectID
                FROM flowerXInvoice FxI
                LEFT JOIN flowers f ON f.flowerID = FxI.flowerID
                LEFT JOIN projects p ON p.projectID = FxI.projectID
                WHERE FxI.invoiceID = $1;`, [invoiceid])

        return respone
    }

    linkBaknTransaction = async (bankTransactionData, selectedInvoices) => {
        this.validateDatabaseConnection()
        await CnxPostgress.db.query(`CALL linkBankTx($1::VARCHAR(255), $2::INT[])`, [bankTransactionData, selectedInvoices])
    }

    getInvoiceBankTransactions = async (id) => {
        this.validateDatabaseConnection()
        return await CnxPostgress.db.query(`SELECT * FROM invoiceTransaction WHERE invoiceID = $1`, [id])
    }

    // -----------------------------------------------
    //                  SERVICES
    // -----------------------------------------------
    
    addNewServiceToProject = async (serviceData, projectID) => {
        this.validateDatabaseConnection()
        await CnxPostgress.db.query("INSERT INTO additionalsXproejct (additionalDescription, clientCost, projectID) VALUES ($1, $2, $3);", 
        [serviceData.description, serviceData.clientcost , projectID])
    }

    editService = async (serviceData) => {
        this.validateDatabaseConnection()
        await CnxPostgress.db.query(`
        UPDATE additionalsXproejct 
        SET 
            additionalDescription = $1,
            clientCost = $2
        WHERE 
            aditionalID = $3;`, 
            [serviceData.description, serviceData.clientcost, serviceData.aditionalid])
    }
   
    getProjectExtras = async (projectId) => {
        this.validateDatabaseConnection()
        return await CnxPostgress.db.query('SELECT additionalDescription AS description, clientCost, aditionalID FROM additionalsXproejct WHERE projectID = $1;', [projectId])
    }

    isExtraProjectClosed = async (extraID) => {
        this.validateDatabaseConnection()
        const res = await CnxPostgress.db.query(`
        SELECT p.isClosed 
        FROM additionalsXproejct a 
        RIGHT JOIN projects p ON a.projectID = p.projectID
        WHERE a.aditionalID = $1;
        `, [extraID])
        return res.rows
    }

}

export default ModelPostgres