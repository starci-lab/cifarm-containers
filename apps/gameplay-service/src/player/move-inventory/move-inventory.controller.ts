import { Controller, Logger } from "@nestjs/common"
import { GrpcMethod } from "@nestjs/microservices"
import { getGrpcData, GrpcName } from "@src/grpc"
import { MoveInventoryService } from "./move-inventory.service"
import { MoveInventoryRequest } from "./move-inventory.dto"

@Controller()
export class MoveInventoryController {
    private readonly logger = new Logger(MoveInventoryController.name)

    constructor(private readonly moveInventoryService : MoveInventoryService) {}

    @GrpcMethod(getGrpcData(GrpcName.Gameplay).data.service, "MoveInventory")
    public async moveInventory(request: MoveInventoryRequest) {
        return this.moveInventoryService.moveInventory(request)
    }
}
