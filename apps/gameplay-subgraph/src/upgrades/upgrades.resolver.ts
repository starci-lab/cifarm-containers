import { Logger } from "@nestjs/common"
import { Resolver, Query, Args, ID } from "@nestjs/graphql"
import { UpgradeService } from "./upgrades.service"
import { UpgradeEntity } from "@src/databases"
import { GetUpgradesArgs } from "./upgrades.dto"

@Resolver()
export class UpgradeResolver {
    private readonly logger = new Logger(UpgradeResolver.name)

    constructor(private readonly upgradesService: UpgradeService) {}

    @Query(() => UpgradeEntity, {
        name: "upgrade",
        nullable:true
    })
    async getUpgrade(@Args("id", { type: () => ID }) id: string): Promise<UpgradeEntity | null> {
        this.logger.debug(`getUpgradeById: id=${id}`)
        return this.upgradesService.getUpgrade(id)
    }

    @Query(() => [UpgradeEntity], {
        name: "upgrades"
    })
    async getUpgrades(@Args("args") args: GetUpgradesArgs): Promise<Array<UpgradeEntity>> {
        this.logger.debug(`getUpgrades: args=${JSON.stringify(args)}`)
        return this.upgradesService.getUpgrades(args)
    }
}
