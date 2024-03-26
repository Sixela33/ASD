import Server from "./server.js";
import "dotenv/config";

new Server(process.env.PORT, process.env.HOST, process.env.DATABASE, process.env.FILE_STORAGE).start()