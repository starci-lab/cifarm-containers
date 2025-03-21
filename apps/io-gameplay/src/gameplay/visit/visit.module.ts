import { Module } from "@nestjs/common"
import { VisitGateway } from "./visit.gateway"
import { AuthModule } from "../auth"

@Module({
    imports: [AuthModule],
    providers: [VisitGateway],
})
export class VisitModule {}