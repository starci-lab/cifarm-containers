import { Controller, Logger } from "@nestjs/common"
import { ActionGateway } from "./action-gateway"
import { EventPattern, Payload } from "@nestjs/microservices"
import { KafkaPattern } from "@src/brokers"
import { EmitActionPayload } from "./action.types"

@Controller()
export class ActionController {
    private readonly logger = new Logger(ActionController.name)

    constructor(private readonly actionGateway: ActionGateway) {}

    @EventPattern(KafkaPattern.EmitAction)
    async emitAction(@Payload() payload: EmitActionPayload) {
        this.logger.log(`Event: ${KafkaPattern.EmitAction}`)
        await this.actionGateway.emitAction(payload)
    }
}
