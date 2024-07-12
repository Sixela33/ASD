import expressWinston from "express-winston"
import { transports, format, config } from "winston"

const logsFolder = process.env.LOGS_FOLDER || 'logs/'

let errorLogger = expressWinston.errorLogger({
    transports: [
        new transports.File({
            maxsize: 50 * 1024 * 1024,
            maxFiles: 10,
            filename: `${logsFolder}errorLogs.log`
        })
    ],
    format: format.combine(
        format.json(),
        format.timestamp()
    ),
    meta: true,
    requestWhitelist: [...expressWinston.requestWhitelist, 'body', 'params', 'query'],
    skip: (err, req, res) => !res.status || res.status == 500,
})

export default errorLogger