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
        console.log(model)
        try {
            console.log("Creating superUser");
            const username = await rl.question("Username: ");
            const email = await rl.question("Email: ");
            const password = await rl.question("Password: ");
            
            // Hashear la contraseña antes de almacenarla
            const hashedPassword = await bcrypt.hash(password, 10);

            console.log({ username, email, hashedPassword });

            await model.registerUser(username, email, hashedPassword);
            let user = await model.getUserByEmail(email)
            user = user.rows[0]
            await model.addRoleToUser(2, user.userid)
            await model.addRoleToUser(3, user.userid)
            
            console.log("SuperUser created succesfully")
        } catch (error) {
            console.error("Error during superuser creation:", error);
        } finally {
            console.log('Closing database connection.');
            await CnxPostgress.disconnect();
        }
    }
};

await createSuperuser();
