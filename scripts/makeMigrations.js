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
            const sql = fs.readFileSync(filesFolder + "/databse.sql", "utf8");
            await model.runQuery(sql)

            console.log("Creating default roles")
            ROLES_LIST.forEach(async (r) => {
                console.log("created role: ", r)
                await model.createRole(r)
            })

            console.log("Creating stored procedures")
            var files = fs.readdirSync(filesFolder + spFolder);
            console.log(files)
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

        }
    }
}

(async () => {
    console.log('Starting migrations');
    await makeMigrations();
})();