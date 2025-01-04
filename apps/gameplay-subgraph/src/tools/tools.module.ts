import { Module } from "@nestjs/common"
import { ToolsResolver } from "./tools.resolver"
import { ToolsService } from "./tools.service"
import { CacheRedisModule } from "@src/cache"
import { CryptoModule } from "@src/crypto"
import { GameplayPostgreSQLModule } from "@src/databases"

@Module({
    imports: [GameplayPostgreSQLModule.forRoot(), CacheRedisModule.forRoot(), CryptoModule],
    providers: [ToolsService, ToolsResolver]
})
export class ToolsModule {}
