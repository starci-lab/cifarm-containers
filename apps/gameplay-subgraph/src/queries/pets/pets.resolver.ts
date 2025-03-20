import { Logger } from "@nestjs/common"
import { Resolver, Query, Args, ID } from "@nestjs/graphql"
import { PetId, PetSchema } from "@src/databases"
import { PetsService } from "./pets.service"

@Resolver()
export class PetsResolver {
    private readonly logger = new Logger(PetsResolver.name)

    constructor(private readonly petsService: PetsService) {}

    @Query(() => [PetSchema], { name: "pets", description: "Get all pets" })
    async pets(): Promise<Array<PetSchema>> {
        return this.petsService.pets()
    }
    
    @Query(() => PetSchema, { name: "pet", description: "Get a pet by ID" })
    async pet(@Args("id", { type: () => ID, description: "The ID of the pet" }) id: PetId): Promise<PetSchema> {
        return this.petsService.pet(id)
    }
}
