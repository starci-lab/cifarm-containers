import { Controller, Logger } from "@nestjs/common"
import { GrpcMethod } from "@nestjs/microservices"
import { authGrpcConstants } from "../../app.constants"
import { RequestMessageService } from "./request-message.service"


@Controller()
export class RequestMessageController {
    private readonly logger = new Logger(RequestMessageController.name)

    constructor(
        private readonly requestMessageService: RequestMessageService,
    ) {}

    @GrpcMethod(authGrpcConstants.SERVICE, "RequestMessage")
    public async requestMessage() {
        this.logger.debug("RequestMessage called")
        return this.requestMessageService.requestMessage()
    }
}
