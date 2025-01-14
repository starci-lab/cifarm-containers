import { Controller, Logger } from "@nestjs/common"
import { GrpcMethod } from "@nestjs/microservices"
import { DeliverInstantlyService } from "./deliver-instantly.service"
import { getGrpcData, GrpcName } from "@src/grpc"

@Controller()
export class DeliveryInstantlyController {
    private readonly logger = new Logger(DeliveryInstantlyController.name)

    constructor(private readonly deliverInstantlyService: DeliverInstantlyService) {}

    @GrpcMethod(getGrpcData(GrpcName.Gameplay).data.service, "DeliverInstantly")
    public async deliverInstantly() {
        this.logger.verbose("DeliveryInstantly")
        return this.deliverInstantlyService.deliverInstantly()
    }
}
