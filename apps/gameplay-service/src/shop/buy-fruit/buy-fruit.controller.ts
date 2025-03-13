import { Body, Controller, Logger } from "@nestjs/common"
import { BuyFruitService } from "./buy-fruit.service"
import { GrpcMethod } from "@nestjs/microservices"
import { BuyFruitRequest, BuyFruitResponse } from "./buy-fruit.dto"
import { getGrpcData, GrpcName } from "@src/grpc"

@Controller()
export class BuyFruitController {
    private readonly logger = new Logger(BuyFruitController.name)

    constructor(private readonly buyFruitService: BuyFruitService) {}

    @GrpcMethod(getGrpcData(GrpcName.Gameplay).data.service, "BuyFruit")
    public async buyFruit(@Body() request: BuyFruitRequest): Promise<BuyFruitResponse> {
        return await this.buyFruitService.buyFruit(request)
    }
}
