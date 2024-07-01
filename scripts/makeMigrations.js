import CnxPostgress from '../model/CnxPostgress.js';
import ModelPostgres from '../model/DAO/ModelPostgres.js';
import fs from "fs";
import ROLES_LIST from '../config/rolesList.js'

const filesFolder = "./migrations"
const spFolder = "/storedProcedures"
const editsFolder = "/edits"

const makeMigrations = async () => {
    if (process.env.DATABASE === "postgres") {
        await CnxPostgress.connect()
        const model = new ModelPostgres()
        try {
            console.log("Making migrations using PostgreSQL");
            const sql = fs.readFileSync(filesFolder + "/database.sql", "utf8");
            await model.runQuery(sql)

            console.log("editing db")

            var editFiles = fs.readdirSync(filesFolder + editsFolder);
            editFiles.forEach(async (file) => {
                try {
                    const sql = fs.readFileSync(filesFolder + editsFolder + "/" + file, "utf8");
                    await model.runQuery(sql)
                    console.log(file, "ran successfully" )
                } catch (e) {
                    console.log(file, "did not run", "\n", e.message )
                }
            })

            console.log("Creating default roles")
 
            for (let [key, value] of Object.entries(ROLES_LIST)) {
                try {
                    await model.createRole(key, value)
                } catch (error) {
                    console.log('Roles where already created, skipping')
                }
            }

            console.log("Creating stored procedures")
            var files = fs.readdirSync(filesFolder + spFolder);
            files.forEach(async (file) => {
                try {
                    const sql = fs.readFileSync(filesFolder + spFolder + "/" + file, "utf8");
                    await model.runQuery(sql)
                    console.log("created: ", file)
                } catch (e) {
                    console.log("error with file: ", file, "\n", e.message)
                }
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