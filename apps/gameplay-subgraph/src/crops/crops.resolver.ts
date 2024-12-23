import { Logger, UseInterceptors } from "@nestjs/common"
import { Resolver, Query, Args } from "@nestjs/graphql"
import { CropsService } from "./crops.service"
import { CropEntity } from "@src/database"
import { GetCropsArgs } from "./"
import { GraphQLCacheInterceptor } from "@src/interceptors/graphql.cache.interceptor"

@Resolver()
export class CropsResolver {
    private readonly logger = new Logger(CropsResolver.name)

    constructor(private readonly cropsService: CropsService) {}

    @Query(() => [CropEntity], {
        name: "crops"
    })
    @UseInterceptors(GraphQLCacheInterceptor)
    async getCrops(@Args("args") args: GetCropsArgs): Promise<Array<CropEntity>> {
        this.logger.debug(`getCrops: args=${JSON.stringify(args)}`)
        return this.cropsService.getCrops(args)
    }

    @Query(() => CropEntity, {
        name: "crop",
        nullable:true
    })
    @UseInterceptors(GraphQLCacheInterceptor)
    async getCropById(@Args("id") id: string): Promise<CropEntity> {
        this.logger.debug(`getCropById: id=${id}`)
        return this.cropsService.getCropById(id)
    }
}
