import { Module } from "@nestjs/common"
import { TerrainsResolver } from "./terrains.resolver"
import { TerrainsService } from "./terrains.service"

@Module({
    imports: [],
    providers: [TerrainsService, TerrainsResolver]
})
export class TerrainsModule {}
