import { Logger } from "@nestjs/common"
import { Resolver, Query, Args, ID } from "@nestjs/graphql"
import { CropsService } from "./crops.service"
import { CropEntity } from "@src/databases"

@Resolver()
export class CropsResolver {
    private readonly logger = new Logger(CropsResolver.name)

    constructor(private readonly cropsService: CropsService) {}

    @Query(() => [CropEntity], {
        name: "crops"
    })
    async getCrops(): Promise<Array<CropEntity>> {
        return this.cropsService.getCrops()
    }

    @Query(() => CropEntity, {
        name: "crop",
        nullable: true
    })
    async getCrop(@Args("id", { type: () => ID }) id: string): Promise<CropEntity> {
        this.logger.debug(`getCropById: id=${id}`)
        return this.cropsService.getCrop(id)
    }
}
