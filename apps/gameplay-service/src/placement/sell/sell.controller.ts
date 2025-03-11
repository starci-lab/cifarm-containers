import { Body, Controller, Logger } from "@nestjs/common"
import { GrpcMethod } from "@nestjs/microservices"
import { getGrpcData, GrpcName } from "@src/grpc"
import { SellService } from "./sell.service"
import { SellRequest } from "./sell.dto"

@Controller()
export class SellController {
    private readonly logger = new Logger(SellController.name)
    constructor(
            private readonly placementService: SellService
    ){}

    @GrpcMethod(getGrpcData(GrpcName.Gameplay).data.service, "Sell") 
    public async sell(@Body() request: SellRequest) {
        this.logger.debug(`Received request to sell placement: ${JSON.stringify(request)}`)
        return await this.placementService.sell(request)
    }
    
}
