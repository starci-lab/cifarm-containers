import { Controller, Logger } from "@nestjs/common"
import { GrpcMethod } from "@nestjs/microservices"
import { DataSource } from "typeorm"
import { HealthcheckEntity } from "@src/database"
import { authGrpcConstants } from "../constant"
import { RequestMessageResponse } from "./request-message.dto"

@Controller()
export class RequestMessageService {
    private readonly logger = new Logger(RequestMessageService.name)

    constructor(
        private readonly dataSource: DataSource,
        private readonly 
    ) {}

  @GrpcMethod(authGrpcConstants.SERVICE, "RequestMessage")
    public async requestMessage(): Promise<RequestMessageResponse> {
        this.logger.debug("Request message request received")
        await this.dataSource.manager.save(HealthcheckEntity, {})
        return {
            message: "ok",
        }
    }    
}
