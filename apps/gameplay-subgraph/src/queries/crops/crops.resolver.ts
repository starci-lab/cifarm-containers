import { Logger, UseGuards } from "@nestjs/common"
import { Resolver, Query, Args, ID } from "@nestjs/graphql"
import { CropsService } from "./crops.service"
import { CropId, CropSchema } from "@src/databases"
import { GraphQLThrottlerGuard } from "@src/throttler"

@Resolver()
export class CropsResolver {
    private readonly logger = new Logger(CropsResolver.name)

    constructor(private readonly cropsService: CropsService) {}

    
    @UseGuards(GraphQLThrottlerGuard)
    @Query(() => [CropSchema], { name: "crops", description: "Get all crops" })
    crops(): Array<CropSchema> {
        return this.cropsService.crops()
    }
    
    
    @UseGuards(GraphQLThrottlerGuard)
    @Query(() => CropSchema, { name: "crop", description: "Get a crop by ID" })
    crop(@Args("id", { type: () => ID, description: "The ID of the crop" }) id: CropId): CropSchema {
        return this.cropsService.crop(id)
    }
}
