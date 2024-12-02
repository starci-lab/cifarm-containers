import { Controller, Logger } from "@nestjs/common"
import { GrpcMethod } from "@nestjs/microservices"
import { DeliverInstantlyService } from "./deliver-instantly.service"
import { grpcConfig, GrpcServiceName } from "@src/config"

@Controller()
export class DeliveryInstantlyController {
    private readonly logger = new Logger(DeliveryInstantlyController.name)

    constructor(private readonly deliverInstantlyService: DeliverInstantlyService) {}

    @GrpcMethod(grpcConfig[GrpcServiceName.Gameplay].service, "DeliverInstantly")
    public async deliverInstantly() {
        this.logger.verbose("DeliveryInstantly")
        return this.deliverInstantlyService.deliverInstantly()
    }
}
