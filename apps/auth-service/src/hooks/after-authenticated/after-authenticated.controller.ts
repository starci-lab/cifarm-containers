import { Controller, Logger } from "@nestjs/common"
import { GrpcMethod } from "@nestjs/microservices"
import { AfterAuthenticatedRequest } from "./after-authenticated.dto"
import { AfterAuthenticatedService } from "./after-authenticated.service"
import { authGrpcConstants } from "../../app.constants"

@Controller()
export class AfterAuthenticatedController {
    private readonly logger = new Logger(AfterAuthenticatedController.name)

    constructor(private readonly afterAuthenticatedService: AfterAuthenticatedService) {}

    @GrpcMethod(authGrpcConstants.SERVICE, "AfterAuthenticated")
    public async afterAuthenticated(request: AfterAuthenticatedRequest) {
        this.logger.debug(`After authenticated for user ${request.userId}`)
        return this.afterAuthenticatedService.afterAuthenticated(request)
    }
}
