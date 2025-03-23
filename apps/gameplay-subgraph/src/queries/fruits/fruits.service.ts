import { Injectable, Logger } from "@nestjs/common"
import { FruitId, FruitSchema } from "@src/databases"
import { StaticService } from "@src/gameplay/static"

@Injectable()
export class FruitsService {
    private readonly logger = new Logger(FruitsService.name)

    constructor(
        private readonly staticService: StaticService
    ) {}

    fruits(): Array<FruitSchema> {
        return this.staticService.fruits
    }

    fruit(id: FruitId): FruitSchema {
        return this.staticService.fruits.find((fruit) => fruit.displayId === id)
    }
}
