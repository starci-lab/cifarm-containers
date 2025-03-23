import { Injectable, Logger } from "@nestjs/common"
import { FlowerSchema, FlowerId } from "@src/databases"
import { StaticService } from "@src/gameplay/static"

@Injectable()
export class FlowersService {
    private readonly logger = new Logger(FlowersService.name)

    constructor(
        private readonly staticService: StaticService   
    ) {}

    flowers(): Array<FlowerSchema> {
        return this.staticService.flowers
    }

    flower(id: FlowerId): FlowerSchema {
        return this.staticService.flowers.find((flower) => flower.id === id)
    }
}
