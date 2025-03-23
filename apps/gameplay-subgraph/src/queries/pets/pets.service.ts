import { Injectable, Logger } from "@nestjs/common"
import { PetId, PetSchema } from "@src/databases"
import { StaticService } from "@src/gameplay"

@Injectable()
export class PetsService {
    private readonly logger = new Logger(PetsService.name)

    constructor(
        private readonly staticService: StaticService
    ) {}

    pets(): Array<PetSchema> {
        return this.staticService.pets
    }

    pet(id: PetId): PetSchema {
        return this.staticService.pets.find((pet) => pet.displayId === id)
    }
}
