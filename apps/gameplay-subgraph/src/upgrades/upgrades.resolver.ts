import { Logger } from "@nestjs/common"
import { Resolver, Query, Args } from "@nestjs/graphql"
import { UpgradeService } from "./upgrades.service"
import { UpgradeEntity } from "@src/databases"
import { GetUpgradesArgs } from "./upgrades.dto"

@Resolver()
export class UpgradeResolver {
    private readonly logger = new Logger(UpgradeResolver.name)

    constructor(private readonly upgradesService: UpgradeService) {}

    @Query(() => [UpgradeEntity], {
        name: "upgrades"
    })
    async getUpgrades(@Args("args") args: GetUpgradesArgs): Promise<Array<UpgradeEntity>> {
        this.logger.debug(`getUpgrades: args=${JSON.stringify(args)}`)
        return this.upgradesService.getUpgrades(args)
    }

    @Query(() => UpgradeEntity, {
        name: "upgrade",
        nullable:true
    })
    async getUpgradeById(@Args("id") id: string): Promise<UpgradeEntity | null> {
        this.logger.debug(`getUpgradeById: id=${id}`)
        return this.upgradesService.getUpgradeById(id)
    }
}
