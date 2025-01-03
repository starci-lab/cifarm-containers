import { Module } from "@nestjs/common"
import { GraphQLCacheInterceptor } from "./graphql-cache.interceptor"

@Module({
    providers: [GraphQLCacheInterceptor],
    exports: [GraphQLCacheInterceptor],
    imports: []
})
export class GraphQLInterceptorsModule {}
