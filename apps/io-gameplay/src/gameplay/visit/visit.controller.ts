import { Controller, Logger } from "@nestjs/common"
import { EventPattern, Payload } from "@nestjs/microservices"
import { KafkaPattern } from "@src/brokers"
import { VisitGateway } from "./visit.gateway"
import { ReturnPayload, VisitPayload } from "./visit.types"

@Controller()
export class VisitController {
    private readonly logger = new Logger(VisitController.name)

    constructor(private readonly visitGateway: VisitGateway) {}

    @EventPattern(KafkaPattern.Visit)
    async visit(@Payload() payload: VisitPayload) {
        return await this.visitGateway.visit(payload)
    }

    @EventPattern(KafkaPattern.Return)
    async return(@Payload() payload: ReturnPayload) {
        this.visitGateway.return(payload)
    }
}
