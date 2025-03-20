import { Logger } from "@nestjs/common"
import { Resolver, Query, Args, ID } from "@nestjs/graphql"
import { CropsService } from "./crops.service"
import { CropId, CropSchema } from "@src/databases"

@Resolver()
export class CropsResolver {
    private readonly logger = new Logger(CropsResolver.name)

    constructor(private readonly cropsService: CropsService) {}

    @Query(() => [CropSchema], { name: "crops", description: "Get all crops" })
    async crops(): Promise<Array<CropSchema>> {
        return this.cropsService.crops()
    }
    
    @Query(() => CropSchema, { name: "crop", description: "Get a crop by ID" })
    async crop(@Args("id", { type: () => ID, description: "The ID of the crop" }) id: CropId): Promise<CropSchema> {
        return this.cropsService.crop(id)
    }
}
