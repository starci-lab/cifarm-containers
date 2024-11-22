import { CACHE_KEY_METADATA, CacheInterceptor } from "@nestjs/cache-manager"
import { ExecutionContext } from "@nestjs/common"

export class IdCacheInterceptor extends CacheInterceptor {
    trackBy(context: ExecutionContext): string | undefined {
        const rpcContext = context.switchToRpc()
        const data = rpcContext.getData()
        const id = data?.id

        const cacheMetadata = this.reflector.get(CACHE_KEY_METADATA, context.getHandler())

        return `${cacheMetadata}:${id}`
    }
}
