import { Injectable, LoggerService } from "@nestjs/common"
import chalk from "chalk"

@Injectable()
export class CliLogger implements LoggerService {

    private readonly logLevels: Map<string, { color: chalk.Chalk, emoji: string, logMethod: (...data: string[]) => void }> = new Map()

    constructor() {
        // Initialize log level map
        this.logLevels.set("log", { color: chalk.bold.green, emoji: "", logMethod: console.log })
        this.logLevels.set("error", { color: chalk.bold.red, emoji: "", logMethod: console.error })
        this.logLevels.set("warn", { color: chalk.bold.yellow, emoji: "", logMethod: console.warn })
        this.logLevels.set("debug", { color: chalk.bold.blue, emoji: "", logMethod: console.debug })
        this.logLevels.set("verbose", { color: chalk.bold.cyan, emoji: "", logMethod: console.debug })
        this.logLevels.set("info", { color: chalk.bold.magenta, emoji: "", logMethod: console.info })
    }

    private printLog(level: string, name: string, message: string, extra?: string) {
        const logLevel = this.logLevels.get(level)
        if (logLevel) {
            const formattedName  = `[${name}]`
            const formattedMessage = `${logLevel.color(formattedName)} ${message}`
            const formattedExtra = extra ? `${chalk.gray(extra)}` : ""   
            logLevel.logMethod(formattedMessage, formattedExtra ? ("\n" + formattedExtra) : "")    
        }
    }

    log(name: string, message: string, extra?: string) {
        this.printLog("log", name, message, extra)
    }

    error(name: string, message: string, extra?: string) {
        this.printLog("error", name, message, extra)
    }

    warn(name: string, message: string, extra?: string) {
        this.printLog("warn", name, message, extra)
    }

    debug(name: string, message: string, extra?: string) {
        this.printLog("debug", name, message, extra)
    }

    verbose(name: string, message: string, extra?: string) {
        this.printLog("verbose", name, message, extra)
    }

    info(name: string, message: string, extra?: string) {
        this.printLog("info", name, message, extra)
    }
}