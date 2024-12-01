import { Injectable, ExecutionContext, CallHandler, NestInterceptor, Inject, Logger } from "@nestjs/common"
import { GqlExecutionContext } from "@nestjs/graphql"
import { Observable, of } from "rxjs"
import { tap } from "rxjs/operators"
import { Cache } from "cache-manager"

@Injectable()
export class GraphQLCacheInterceptor implements NestInterceptor {
    private readonly logger = new Logger(GraphQLCacheInterceptor.name)

    constructor(@Inject("CACHE_MANAGER") private cacheManager: Cache
    ) { }


    async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<unknown>> {
        const ctx = GqlExecutionContext.create(context)
        const info = ctx.getInfo()
        const args = ctx.getArgs()
        const key = this.generateCacheKey(info.fieldName, args)
        const value = await this.cacheManager.get(key)
        if (value) { 
            this.logger.debug(`Cache hit for key: ${key}`)
            return of(value)
        }
        return next.handle().pipe(
            tap(response => {
                this.logger.debug(`Cache save: ${key}`)
                this.cacheManager.set(key, response)
            })
        )
    }

    private generateCacheKey(fieldName: string, args: unknown): string {
        return `${fieldName}:${JSON.stringify(args)}`
    }
}