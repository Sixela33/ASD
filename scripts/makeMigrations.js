import CnxPostgress from '../model/CnxPostgress.js';
import ModelPostgres from '../model/DAO/ModelPostgres.js';
import fs from "fs";
import ROLES_LIST from '../config/rolesList.js'

const filesFolder = "./migrations"
const spFolder = "/storedProcedures"

const makeMigrations = async () => {
    if (process.env.DATABASE === "postgres") {
        await CnxPostgress.connect()
        const model = new ModelPostgres()
        try {
            console.log("Making migrations using PostgreSQL");
            const sql = fs.readFileSync(filesFolder + "/database.sql", "utf8");
            await model.runQuery(sql)

            console.log("Creating default roles")
 
            for (const [key, value] of Object.entries(ROLES_LIST)) {
                await model.createRole(key, value)
            }

            console.log("Creating stored procedures")
            var files = fs.readdirSync(filesFolder + spFolder);
            files.forEach(async (file) => {
                const sql = fs.readFileSync(filesFolder + spFolder + "/" + file, "utf8");
                await model.runQuery(sql)
                console.log("created: ", file)
            })

            console.log("migrations ran successfully");
        } catch (error) {
            console.log("ERROR WHILE RUNNING MIGRATIONS: \n ", error);
            
            
        } finally {
            console.log('Closing database connection.');
            await CnxPostgress.disconnect();
            console.log('Database conection closed.');

        }
    }
}

(async () => {
    console.log('Starting migrations');
    await makeMigrations();
})();