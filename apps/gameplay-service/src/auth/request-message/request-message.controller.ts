import { Controller, Logger } from "@nestjs/common"
import { GrpcMethod } from "@nestjs/microservices"
import { RequestMessageService } from "./request-message.service"
import { grpcData, GrpcServiceName } from "@src/grpc"
  
@Controller()
export class RequestMessageController {
    private readonly logger = new Logger(RequestMessageController.name)

    constructor(private readonly requestMessageService: RequestMessageService) {}

    @GrpcMethod(grpcData[GrpcServiceName.Gameplay].service, "RequestMessage")
    public async requestMessage() {
        return this.requestMessageService.requestMessage()
    }
}
