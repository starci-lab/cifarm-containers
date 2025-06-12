// graphql-cache.interceptor.ts
import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
} from "@nestjs/common"
import { GqlExecutionContext } from "@nestjs/graphql"
import { InjectCache } from "@src/cache"
import { Cache } from "cache-manager"
import { Observable, of } from "rxjs"
import { tap } from "rxjs/operators"
import { GRAPHQL_CACHE_TTL } from "./types"
import { Reflector } from "@nestjs/core"
  
  @Injectable()
export class GraphQLCacheInterceptor<T> implements NestInterceptor {
    constructor(
      @InjectCache() private readonly cacheManager: Cache,
      private readonly reflector: Reflector
    ) {}
  
    async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<T>> {
        const gqlCtx = GqlExecutionContext.create(context)
        const info = gqlCtx.getInfo()
        const args = gqlCtx.getArgs()
  
        // Use query name and serialized args as the cache key
        const fieldName = info.fieldName
        const argsKey = JSON.stringify(args?.request || {})
        const cacheKey = `graphql:${fieldName}:${argsKey}`
  
        // Read TTL from metadata (defaults to 1 day)
        const ttl = this.reflector.get<number>(GRAPHQL_CACHE_TTL, context.getHandler()) || 60 * 60 * 24
  
        const cached = await this.cacheManager.get<T>(cacheKey)
        if (cached) {
            return of(cached)
        }
  
        return next.handle().pipe(
            tap((data) => {
                this.cacheManager.set(cacheKey, data, ttl)
            })
        )
    }
}