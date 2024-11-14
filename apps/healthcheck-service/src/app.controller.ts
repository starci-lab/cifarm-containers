import { Controller, Logger } from "@nestjs/common"
import { GrpcMethod } from "@nestjs/microservices"
import { healthcheckGrpcConstants } from "./constants"
import { DoHealthcheckResponse, DoHealthcheckService } from "./do-healthcheck"

@Controller()
export class AppController {
    private readonly logger = new Logger(AppController.name)

    constructor(private readonly doHealthcheckService: DoHealthcheckService) {}

    @GrpcMethod(healthcheckGrpcConstants.SERVICE, "DoHealthcheck")
    public async doHealthcheck(): Promise<DoHealthcheckResponse> {
        this.logger.debug("DoHealthcheck called")
        return await this.doHealthcheckService.doHealthcheck()
    }
}
