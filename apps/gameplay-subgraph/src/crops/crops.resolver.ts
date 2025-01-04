import { Logger } from "@nestjs/common"
import { Resolver, Query, Args, ID } from "@nestjs/graphql"
import { CropsService } from "./crops.service"
import { CropEntity } from "@src/databases"
import { GetCropsArgs } from "./crops.dto"

@Resolver()
export class CropsResolver {
    private readonly logger = new Logger(CropsResolver.name)

    constructor(private readonly cropsService: CropsService) {}

    @Query(() => [CropEntity], {
        name: "crops"
    })
    async getCrops(@Args("args") args: GetCropsArgs): Promise<Array<CropEntity>> {
        this.logger.debug(`getCrops: args=${JSON.stringify(args)}`)
        return this.cropsService.getCrops(args)
    }

    @Query(() => CropEntity, {
        name: "crop",
        nullable:true
    })
    async getCropById(@Args("id", { type: () => ID }) id: string): Promise<CropEntity> {
        this.logger.debug(`getCropById: id=${id}`)
        return this.cropsService.getCropById(id)
    }
}
