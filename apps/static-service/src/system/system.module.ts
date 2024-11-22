import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { SystemEntity } from "@src/database"
import { SystemController } from "./system.controller"
import { SystemService } from "./system.service"

@Module({
    imports: [TypeOrmModule.forFeature([SystemEntity])],
    controllers: [SystemController],
    providers: [SystemService],
    exports: [SystemService]
})
export class SystemModule {}
