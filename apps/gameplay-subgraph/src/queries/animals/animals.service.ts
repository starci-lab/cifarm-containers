import { Injectable, Logger } from "@nestjs/common"
import { AnimalId, AnimalSchema } from "@src/databases"
import { StaticService } from "@src/gameplay/static"

@Injectable()
export class AnimalsService {
    private readonly logger = new Logger(AnimalsService.name)

    constructor(
        private readonly staticService: StaticService
    ) {}

    animals(): Array<AnimalSchema> {
        return this.staticService.animals
    }

    animal(id: AnimalId): AnimalSchema {
        return this.staticService.animals.find((animal) => animal.displayId === id)
    }
}
