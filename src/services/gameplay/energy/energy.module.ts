import { Global, Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { UserEntity } from "@src/database"
import { EnergyService } from "./energy.service"

@Global()
@Module({
    imports: [TypeOrmModule.forFeature([UserEntity])],
    providers: [EnergyService],
    exports: [EnergyService]
})
export class EnergyModule {}
