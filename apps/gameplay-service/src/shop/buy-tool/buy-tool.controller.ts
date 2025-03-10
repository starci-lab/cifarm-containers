import { Controller, Logger } from "@nestjs/common"
import { GrpcMethod } from "@nestjs/microservices"
import { BuyToolRequest } from "./buy-tool.dto"
import { BuyToolService } from "./buy-tool.service"
import { getGrpcData, GrpcName } from "@src/grpc"

@Controller()
export class BuyToolController {
    private readonly logger = new Logger(BuyToolController.name)

    constructor(private readonly buyToolService: BuyToolService) {}

    @GrpcMethod(getGrpcData(GrpcName.Gameplay).data.service, "BuyTool")
    public async buyTool(request: BuyToolRequest) {
        return this.buyToolService.buyTool(request)
    }
}
