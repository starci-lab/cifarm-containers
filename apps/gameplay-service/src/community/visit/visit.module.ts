import { Module } from "@nestjs/common"
import { VisitController } from "./visit.controller"
import { VisitService } from "./visit.service"
import { GameplayPostgreSQLModule } from "@src/databases"

@Module({
    imports: [GameplayPostgreSQLModule.forRoot()],
    controllers: [VisitController],
    providers: [VisitService]
})
export class VisitModule {}
