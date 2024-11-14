import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { SpinEntity } from "@src/database"
import { SpinsResolver } from "./spins.resolver"
import { SpinsService } from "./spins.service"

@Module({
    imports: [TypeOrmModule.forFeature([SpinEntity])],
    providers: [SpinsService, SpinsResolver]
})
export class SpinsModule {}
