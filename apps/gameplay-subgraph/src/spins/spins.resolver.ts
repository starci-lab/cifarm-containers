import { Logger, UseInterceptors } from "@nestjs/common"
import { Args, Query, Resolver } from "@nestjs/graphql"
import { GetSpinsArgs } from "./"
import { SpinsService } from "./spins.service"
import { SpinSlotEntity } from "@src/database"
import { GraphQLCacheInterceptor } from "@src/interceptors/graphql.cache.interceptor"

@Resolver()
export class SpinsResolver {
    private readonly logger = new Logger(SpinsResolver.name)

    constructor(private readonly spinsService: SpinsService) {}

    @Query(() => [SpinSlotEntity], {
        name: "spin_slots"
    })
    @UseInterceptors(GraphQLCacheInterceptor)
    async getSpins(@Args("args") args: GetSpinsArgs): Promise<Array<SpinSlotEntity>> {
        return this.spinsService.getSpins(args)
    }

    @Query(() => SpinSlotEntity, {
        name: "spin_slot",
        nullable:true
    })
    @UseInterceptors(GraphQLCacheInterceptor)
    async getSpinSlotById(@Args("id") id: string): Promise<SpinSlotEntity | null> {
        this.logger.debug(`getSpinSlotById: id=${id}`)
        return this.spinsService.getSpinSlotById(id)
    }
}
