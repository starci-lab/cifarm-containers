import { Logger, UseGuards } from "@nestjs/common"
import { Resolver, Query, Args, ID } from "@nestjs/graphql"
import { PetId, PetSchema } from "@src/databases"
import { PetsService } from "./pets.service"
import { GraphQLThrottlerGuard } from "@src/throttler"

@Resolver()
export class PetsResolver {
    private readonly logger = new Logger(PetsResolver.name)

    constructor(private readonly petsService: PetsService) {}

    
    @UseGuards(GraphQLThrottlerGuard)
    @Query(() => [PetSchema], { name: "pets", description: "Get all pets" })
    pets(): Array<PetSchema> {
        return this.petsService.pets()
    }
    
    
    @UseGuards(GraphQLThrottlerGuard)
    @Query(() => PetSchema, { name: "pet", description: "Get a pet by ID" })
    pet(@Args("id", { type: () => ID, description: "The ID of the pet" }) id: PetId): PetSchema {
        return this.petsService.pet(id)
    }
}
