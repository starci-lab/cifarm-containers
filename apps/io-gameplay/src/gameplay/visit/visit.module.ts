import { Module } from "@nestjs/common"
import { VisitGateway } from "./visit.gateway"
import { AuthModule } from "../auth"
import { VisitController } from "./visit.controller"

@Module({
    imports: [AuthModule],
    providers: [VisitGateway],
    controllers: [VisitController]
})
export class VisitModule {}