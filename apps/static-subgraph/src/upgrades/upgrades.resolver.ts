import { GetUpgradesArgs } from "@apps/static-subgraph/src/upgrades/upgrades.dto"
import { UpgradeService } from "@apps/static-subgraph/src/upgrades/upgrades.service"
import { Logger, UseInterceptors } from "@nestjs/common"
import { Resolver, Query, Args } from "@nestjs/graphql"
import { UpgradeEntity } from "@src/database"
import { GraphQLCacheInterceptor } from "@src/interceptors/graphql.cache.interceptor"

@Resolver()
export class UpgradeResolver {
    private readonly logger = new Logger(UpgradeResolver.name)

    constructor(private readonly upgradesService: UpgradeService) {}
    @Query(() => [UpgradeEntity], {
        name: "upgrades"
    })
    @UseInterceptors(GraphQLCacheInterceptor)
    async getUpgrades(@Args("args") args: GetUpgradesArgs): Promise<Array<UpgradeEntity>> {
        this.logger.debug(`getUpgrades: args=${JSON.stringify(args)}`)
        return this.upgradesService.getUpgrades(args)
    }
}
