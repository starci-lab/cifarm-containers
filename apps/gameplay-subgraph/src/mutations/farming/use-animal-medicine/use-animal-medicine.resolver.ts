import { Logger, UseGuards } from "@nestjs/common"
import { UseAnimalMedicineRequest } from "./use-animal-medicine.dto"
import { UseAnimalMedicineService } from "./use-animal-medicine.service"
import { Args, Mutation, Resolver } from "@nestjs/graphql"
import { GraphQLJwtAuthGuard } from "@src/jwt"
import { GraphQLUser } from "@src/decorators"
import { UserLike } from "@src/jwt"
import { VoidResolver } from "graphql-scalars"

@Resolver()
export class UseAnimalMedicineResolver {
    private readonly logger = new Logger(UseAnimalMedicineResolver.name)

    constructor(private readonly useAnimalMedicineService: UseAnimalMedicineService) {}

    @UseGuards(GraphQLJwtAuthGuard)
    @Mutation(() => VoidResolver, { name: "useAnimalMedicine", description: "Use animal medicine", nullable: true })
    public async useAnimalMedicine(
        @GraphQLUser() user: UserLike,
        @Args("request") request: UseAnimalMedicineRequest
    ) {
        return this.useAnimalMedicineService.useAnimalMedicine(user, request)
    }
}
