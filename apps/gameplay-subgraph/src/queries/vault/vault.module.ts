import { Module } from "@nestjs/common"
import { VaultResolver } from "./vault.resolver"
import { GraphQLVaultService } from "./vault.service"

@Module({
    providers: [GraphQLVaultService, VaultResolver]
})
export class VaultModule {}