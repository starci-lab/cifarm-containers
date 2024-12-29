import { Module } from "@nestjs/common"
import {
    cacheRegisterAsync,
    configForRoot,
    graphqlGameplaySubgraphForRoot,
    typeOrmForRoot
} from "@src/dynamic-modules"

@Module({
    imports: [
        configForRoot(),
        typeOrmForRoot(),
        cacheRegisterAsync(),
        graphqlGameplaySubgraphForRoot(),
    ]
}) 
export class AppModule {}
