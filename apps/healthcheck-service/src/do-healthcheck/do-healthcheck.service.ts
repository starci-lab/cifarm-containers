import { Controller, Logger } from "@nestjs/common"
import { GrpcMethod } from "@nestjs/microservices"
import { DoHealthcheckResponse } from "./do-healthcheck.dto"
import { healthcheckGrpcConstants } from "../constant"

@Controller()
export class DoHealthcheckService {
    private readonly logger = new Logger(DoHealthcheckService.name)

    constructor() {}

  @GrpcMethod(healthcheckGrpcConstants.SERVICE, "DoHealthcheck")
    public doHealthcheck(): DoHealthcheckResponse {
        this.logger.debug("Healthcheck request received")
        return {
            message: "ok",
        }
    }
}
