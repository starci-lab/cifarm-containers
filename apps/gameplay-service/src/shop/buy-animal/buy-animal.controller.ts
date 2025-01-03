import { Controller, Logger } from "@nestjs/common"
import { GrpcMethod } from "@nestjs/microservices"
import { BuyAnimalRequest } from "./buy-animal.dto"
import { BuyAnimalService } from "./buy-animal.service"
import { grpcData, GrpcServiceName } from "@src/grpc"

@Controller()
export class BuyAnimalController {
    private readonly logger = new Logger(BuyAnimalController.name)

    constructor(private readonly buyAnimalService: BuyAnimalService) {}

    @GrpcMethod(grpcData[GrpcServiceName.Gameplay].service, "BuyAnimal")
    public async buyAnimal(request: BuyAnimalRequest) {
        this.logger.debug("BuyAnimal called")
        return this.buyAnimalService.buyAnimal(request)
    }
}
