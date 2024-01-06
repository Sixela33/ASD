import pg from 'pg';
import "dotenv/config";

class CnxPostgress {

    static pool = new pg.Pool({
        user: process.env.POSTGRES_DB_USER,
        password: process.env.POSTGRES_DB_PASSWORD,
        host: process.env.POSTGRES_DB_HOST,
        port: process.env.POSTGRES_DB_PORT,
        database: process.env.POSTGRES_DB_NAME
    })
    static connection = false
    static db = null

    static connect = async () => {
        try {
            console.log("Connecting to the database...")
            CnxPostgress.db = await CnxPostgress.pool.connect()
            console.log("Database connected succesfully!")
            CnxPostgress.connection = true
        } catch (error) {
            console.log("[ERROR IN DB CONNECTION] \n" + "=========================================================" + "\n" , error)
        }
    }

    static disconnect = async () => {
        if(CnxPostgress.db){
            await CnxPostgress.db.release()
            CnxPostgress.connection = false
        }
    }
}

export default CnxPostgress