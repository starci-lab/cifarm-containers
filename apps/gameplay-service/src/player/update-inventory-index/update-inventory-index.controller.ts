import { Controller, Logger } from "@nestjs/common"
import { GrpcMethod } from "@nestjs/microservices"
import { getGrpcData, GrpcName } from "@src/grpc"
import { UpdateInventoryIndexService } from "./update-inventory-index.service"
import { UpdateInventoryIndexRequest } from "./update-inventory-index.dto"

@Controller()
export class UpdateInventoryIndexController {
    private readonly logger = new Logger(UpdateInventoryIndexController.name)

    constructor(private readonly updateInventoryIndexService: UpdateInventoryIndexService) {}

    @GrpcMethod(getGrpcData(GrpcName.Gameplay).data.service, "UpdateInventoryIndex")
    public async updateInventoryIndex(request: UpdateInventoryIndexRequest) {
        return this.updateInventoryIndexService.updateInventoryIndex(request)
    }
}
