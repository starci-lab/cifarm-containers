import { Controller, Logger } from "@nestjs/common"
import { GrpcMethod } from "@nestjs/microservices"
import { ThiefFruitService } from "./thief-fruit.service"
import { getGrpcData, GrpcName } from "@src/grpc"
import { ThiefFruitRequest } from "./thief-fruit.dto"

@Controller()
export class ThiefFruitController {
    private readonly logger = new Logger(ThiefFruitController.name)

    constructor(private readonly thiefFruitService: ThiefFruitService) {}

    @GrpcMethod(getGrpcData(GrpcName.Gameplay).data.service, "ThiefFruit")
    public async thiefFruit(request: ThiefFruitRequest) {
        return this.thiefFruitService.thiefFruit(request)
    }
}
