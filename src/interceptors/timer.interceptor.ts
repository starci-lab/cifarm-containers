import { Logger, NestInterceptor } from "@nestjs/common"
import { tap } from "rxjs"

export default class TimerInterceptor implements NestInterceptor {
    private readonly logger = new Logger(TimerInterceptor.name)

    constructor() {
    }

    intercept(context, next) {

        const now = Date.now()
        return next.handle().pipe(tap(() => this.logger.debug(`Time: ${Date.now() - now}ms`)))
    }
}