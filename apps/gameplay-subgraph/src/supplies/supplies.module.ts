import { Module } from "@nestjs/common"
import { SuppliesResolver } from "./supplies.resolver"
import { SuppliesService } from "./supplies.service"
import { GameplayPostgreSQLModule } from "@src/databases"
 

@Module({
    imports: [ GameplayPostgreSQLModule.forRoot() ],
    providers: [SuppliesService, SuppliesResolver]
})
export class SuppliesModule {}
