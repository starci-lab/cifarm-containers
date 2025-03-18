import { ConsoleLogger  } from "@nestjs/common"
import { IdService } from "./id.service"

export class IdLogger extends ConsoleLogger {
    constructor(private readonly idService: IdService) {
        super()
    }
    error(message: unknown, stack?: string, context?: string) {
        // add your tailored logic here
        const formattedMessage = `[${this.idService.name} - ${this.idService.id}] - ${message}`
        super.error(formattedMessage, stack, context)
    }

    fatal(message: unknown, context?: unknown, ...rest: Array<unknown>): void {
        // add your tailored logic here
        const formattedMessage = `[${this.idService.name} - ${this.idService.id}] - ${message}`
        super.fatal(formattedMessage, context, ...rest)
    }

    log(message: unknown, context?: unknown, ...rest: Array<unknown>): void {
        // add your tailored logic here
        const formattedMessage = `[${this.idService.name} - ${this.idService.id}] - ${message}`
        super.log(formattedMessage, context, ...rest)
    }

    warn(message: unknown, context?: unknown, ...rest: Array<unknown>): void {
        // add your tailored logic here
        const formattedMessage = `[${this.idService.name} - ${this.idService.id}] - ${message}`
        super.warn(formattedMessage, context, ...rest)
    }

    debug(message: unknown, context?: unknown, ...rest: Array<unknown>): void {
        // add your tailored logic here
        const formattedMessage = `[${this.idService.name} - ${this.idService.id}] - ${message}`
        super.debug(formattedMessage, context, ...rest)
    }

    verbose(message: unknown, context?: unknown, ...rest: Array<unknown>): void {
        // add your tailored logic here
        const formattedMessage = `[${this.idService.name} - ${this.idService.id}] - ${message}`
        super.verbose(formattedMessage, context, ...rest)
    }   
}
