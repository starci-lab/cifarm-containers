import { Logger, UseGuards } from "@nestjs/common"
import { HelpUseAnimalMedicineService } from "./help-use-animal-medicine.service"
import { HelpUseAnimalMedicineRequest } from "./help-use-animal-medicine.dto"
import { GraphQLJwtAuthGuard, UserLike } from "@src/jwt"
import { Args, Mutation, Resolver } from "@nestjs/graphql"
import { GraphQLUser } from "@src/decorators"
import { VoidResolver } from "graphql-scalars"

@Resolver()
export class HelpUseAnimalMedicineResolver {
    private readonly logger = new Logger(HelpUseAnimalMedicineResolver.name)

    constructor(private readonly helpUseAnimalMedicineService: HelpUseAnimalMedicineService) {}

    @UseGuards(GraphQLJwtAuthGuard)
    @Mutation(() => VoidResolver, {
        name: "helpUseAnimalMedicine",
        description: "Help use animal medicine",
        nullable: true
    })
    public async helpUseAnimalMedicine(
        @GraphQLUser() user: UserLike,
        @Args("request") request: HelpUseAnimalMedicineRequest
    ) {
        return this.helpUseAnimalMedicineService.helpUseAnimalMedicine(user, request)
    }
}
