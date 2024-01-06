import Server from "./server.js";
import "dotenv/config";
import messageLogger from "./loggers/messageLogger.js";

new Server(process.env.PORT, process.env.HOST, process.env.DATABASE, messageLogger).start()