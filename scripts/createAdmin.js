import CnxPostgress from '../model/CnxPostgress.js';
import ModelPostgres from '../model/DAO/ModelPostgres.js';
import readline from 'readline/promises';
import ROLES_LIST from '../config/rolesList.js';
import bcrypt from 'bcrypt';

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

const createSuperuser = async () => {
    if (process.env.DATABASE === "postgres") {
        await CnxPostgress.connect();
        const model = new ModelPostgres();
        try {
            const userID = await rl.question("userID: ");
            
       
            await model.setUserPermissionLevel(userID, ROLES_LIST['Admin'])
            
        } catch (error) {
            console.error("Error during superuser creation:", error);
        } finally {
            await CnxPostgress.disconnect();
        }
    }
};


(async () => {
    await createSuperuser();
})();