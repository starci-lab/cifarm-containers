import { Controller, Logger } from "@nestjs/common"
import { GrpcMethod } from "@nestjs/microservices"
import { RequestMessageService } from "./request-message.service"
import { grpcConfig } from "@src/config"

@Controller()
export class RequestMessageController {
    private readonly logger = new Logger(RequestMessageController.name)

    constructor(private readonly requestMessageService: RequestMessageService) {}

    @GrpcMethod(grpcConfig.gameplay.service, "RequestMessage")
    public async requestMessage() {
        this.logger.debug("RequestMessage called")
        return this.requestMessageService.requestMessage()
    }
}
