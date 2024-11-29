import { Controller, Logger } from "@nestjs/common"
import { GrpcMethod } from "@nestjs/microservices"
import { SpinService } from "./spin.service"
import { SpinRequest } from "./spin.dto"
import { gameplayGrpcConstants } from "../../app.constants"

@Controller()
export class SpinController {
    private readonly logger = new Logger(SpinController.name)

    constructor(private readonly spinService: SpinService) {}

    @GrpcMethod(gameplayGrpcConstants.SERVICE, "Spin")
    public async spin(request: SpinRequest) {
        this.logger.debug("Spin called")
        return this.spinService.spin(request)
    }
}
