import { Logger } from "@nestjs/common"
import { Resolver, Query, Args, ID } from "@nestjs/graphql"
import { CropsService } from "./crops.service"
import { CropId, CropSchema } from "@src/databases"

@Resolver()
export class CropsResolver {
    private readonly logger = new Logger(CropsResolver.name)

    constructor(private readonly cropsService: CropsService) {}

    @Query(() => [CropSchema], { name: "crops" })
    async buildings(): Promise<Array<CropSchema>> {
        return this.cropsService.getCrops()
    }
    
    @Query(() => CropSchema, { name: "crop" })
    async crop(@Args("id", { type: () => ID }) id: CropId): Promise<CropSchema> {
        return this.cropsService.getCrop(id)
    }
    
    @Query(() => CropSchema, { name: "cropByKey" })
    async cropByKey(@Args("key") key: string): Promise<CropSchema> {
        return this.cropsService.getCropByKey(key)
    }
}
