import { Controller, Logger } from "@nestjs/common"
import { GrpcMethod } from "@nestjs/microservices"
import { DeliveryInstantlyService } from "./deliver-instantly.service"
import { grpcConfig, GrpcServiceName } from "@src/config"

@Controller()
export class DeliveryInstantlyController {
    private readonly logger = new Logger(DeliveryInstantlyController.name)

    constructor(private readonly deliveryInstantlyService: DeliveryInstantlyService) {}

    @GrpcMethod(grpcConfig[GrpcServiceName.Gameplay].service, "DeliveryInstantly")
    public async deliveryInstantly() {
        this.logger.verbose("Delivering instantly")
        return this.deliveryInstantlyService.deliverInstantly()
    }
}
