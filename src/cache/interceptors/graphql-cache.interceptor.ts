import { Injectable, ExecutionContext, CallHandler, NestInterceptor, Logger } from "@nestjs/common"
import { GqlExecutionContext } from "@nestjs/graphql"
import { Observable, of } from "rxjs"
import { tap } from "rxjs/operators"
import { Cache } from "cache-manager"
import { Sha256Service } from "@src/crypto"
import { CacheRedisService } from "../cache-redis"

@Injectable()
export class GraphQLCacheInterceptor implements NestInterceptor {
    private readonly logger = new Logger(GraphQLCacheInterceptor.name)

    private cacheManager: Cache
    constructor(
        private readonly sha256Service: Sha256Service,
        private readonly cacheRedisService: CacheRedisService,
    ) {
        this.cacheManager = this.cacheRedisService.getCacheManager()
    }


    async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<unknown>> {
        const ctx = GqlExecutionContext.create(context)
        const info = ctx.getInfo()
        const args = ctx.getArgs()
        console.log(info)
        console.log(args)
        const key = this.sha256Service.hash(JSON.stringify({ info, args }))
        const value = await this.cacheManager.get(key)
        if (value) { //ttl 24h
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
}