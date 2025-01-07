import { Module } from "@nestjs/common"
import { PlacedItemsResolver } from "./placed-items.resolver"
import { PlacedItemsService } from "./placed-items.service"
import { GameplayPostgreSQLModule } from "@src/databases"
 

@Module({
    imports: [ GameplayPostgreSQLModule.forFeature() ],
    providers: [PlacedItemsService, PlacedItemsResolver]
})
export class PlacedItemsModule {}
