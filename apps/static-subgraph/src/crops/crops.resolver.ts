import { Logger } from "@nestjs/common"
import { Resolver, Query, Args } from "@nestjs/graphql"
import { CropsService } from "./crops.service"
import { CropEntity } from "@src/database"
import { GetCropsArgs } from "./crops.dto"

@Resolver()
export class CropsResolver {
    private readonly logger = new Logger(CropsResolver.name)

    constructor(private readonly cropsService: CropsService) {}

  @Query(() => [CropEntity], {
      name: "crops",
  })
    async getCrops(@Args("args") args: GetCropsArgs): Promise<Array<CropEntity>> {
        this.logger.debug(`getCrops: args=${JSON.stringify(args)}`)
        return this.cropsService.getCrops(args)
    } 
}