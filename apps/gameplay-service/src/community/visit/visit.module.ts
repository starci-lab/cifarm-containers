import { Module } from "@nestjs/common"
import { VisitController } from "./visit.controller"
import { VisitService } from "./visit.service"
import { TypeOrmModule } from "@nestjs/typeorm"
import { UserEntity } from "@src/database"

@Module({
    imports: [TypeOrmModule.forFeature([UserEntity])],
    controllers: [VisitController],
    providers: [VisitService]
})
export class VisitModule {}
