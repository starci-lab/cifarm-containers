import { Module } from "@nestjs/common"
import { VisitGateway } from "./visit.gateway"
import { AuthModule } from "../auth"
import { VisitConsumer } from "./visit.consumer"

@Module({
    imports: [AuthModule],
    providers: [VisitGateway, VisitConsumer],
})
export class VisitModule {}