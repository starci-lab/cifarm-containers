import { Controller, Logger } from "@nestjs/common"
import { GrpcMethod } from "@nestjs/microservices"
import { DoHealthcheckResponse } from "./do-healthcheck.dto"
import { grpcConstants } from "../constant"

@Controller()
export class DoHealthcheckService {
    private readonly logger = new Logger(DoHealthcheckService.name)

    constructor() {}

  @GrpcMethod(grpcConstants.SERVICE, "DoHealthcheck")
    public doHealthcheck(): DoHealthcheckResponse {
        this.logger.debug("Healthcheck request received")
        return {
            message: "ok",
        }
    }
}
