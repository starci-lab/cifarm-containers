import { AuthController } from "@apps/rest-api-gateway/src/auth"
import { Controller, Logger } from "@nestjs/common"
import { EventPattern, Payload } from "@nestjs/microservices"
import { kafkaConfig, KafkaConfigKey } from "@src/config"
import { BroadcastGateway } from "./broadcast.gateway"

@Controller()
export class BroadcastController {
    private readonly logger = new Logger(BroadcastController.name)

    constructor(private readonly broadcastGateway: BroadcastGateway,
        private readonly authController: AuthController
    ) {}

    //Get HelloWorld message
    async getHelloWorld() {
        return "Hello World" + await this.authController.requestMessage()
    }


    //Event based
    @EventPattern(kafkaConfig[KafkaConfigKey.BroadcastPlacedItems].pattern)
    async broadcastPlacedItems(@Payload() payload: any) {
        console.log("broadcastPlacedItems", {
            payload,
            value: await this.authController.requestMessage()
        })

        return {
            key: payload,
            value: await this.authController.requestMessage()
        }
    }
    
}
