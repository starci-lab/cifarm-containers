import { Module } from "@nestjs/common"
import { ReturnController } from "./return.controller"
import { ReturnService } from "./return.service"
import { TypeOrmModule } from "@nestjs/typeorm"
import { UserEntity } from "@src/database"

@Module({
    imports: [TypeOrmModule.forFeature([UserEntity])],
    controllers: [ReturnController],
    providers: [ReturnService]
})
export class ReturnModule {}
