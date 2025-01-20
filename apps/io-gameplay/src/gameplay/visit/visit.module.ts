import { Module } from "@nestjs/common"
import { VisitGateway } from "./visit.gateway"
import { AuthModule } from "@src/blockchain"

@Module({
    imports: [AuthModule],
    providers: [VisitGateway],
})
export class VisitModule {}