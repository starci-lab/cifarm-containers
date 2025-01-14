import { Controller, Logger } from "@nestjs/common"
import { GrpcMethod } from "@nestjs/microservices"
import { ThiefAnimalProductService } from "./thief-animal-product.service"
import { getGrpcData, GrpcName } from "@src/grpc"
import { ThiefAnimalProductRequest } from "./thief-animal-product.dto"

@Controller()
export class ThiefAnimalProductController {
    private readonly logger = new Logger(ThiefAnimalProductController.name)

    constructor(private readonly thiefAnimalProductService: ThiefAnimalProductService) {}

    @GrpcMethod(getGrpcData(GrpcName.Gameplay).data.service, "ThiefAnimalProduct")
    public async thiefAnimalProduct(request: ThiefAnimalProductRequest) {
        this.logger.debug("ThiefAnimalProduct request called: " + JSON.stringify(request))
        return this.thiefAnimalProductService.theifAnimalProduct(request)
    }
}
