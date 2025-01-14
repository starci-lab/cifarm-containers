import { Controller, Logger } from "@nestjs/common"
import { GrpcMethod } from "@nestjs/microservices"
import { SpinService } from "./spin.service"
import { SpinRequest } from "./spin.dto"
import { getGrpcData, GrpcName } from "@src/grpc"

@Controller()
export class SpinController {
    private readonly logger = new Logger(SpinController.name)
    
    constructor(private readonly spinService: SpinService) {}

    @GrpcMethod(getGrpcData(GrpcName.Gameplay).data.service, "Spin")
    public async spin(request: SpinRequest) {
        this.logger.debug("Spin called")
        return this.spinService.spin(request)
    }
}
