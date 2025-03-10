import { Logger } from "@nestjs/common"
import { Resolver, Query, Args, ID } from "@nestjs/graphql"
import { PetId, PetSchema } from "@src/databases"
import { PetsService } from "./pets.service"

@Resolver()
export class PetsResolver {
    private readonly logger = new Logger(PetsResolver.name)

    constructor(private readonly petsService: PetsService) {}

    @Query(() => [PetSchema], { name: "pets" })
    async pets(): Promise<Array<PetSchema>> {
        return this.petsService.getPets()
    }
    
    @Query(() => PetSchema, { name: "pet" })
    async pet(@Args("id", { type: () => ID }) id: PetId): Promise<PetSchema> {
        return this.petsService.getPet(id)
    }
}
