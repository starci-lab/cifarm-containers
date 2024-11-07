import { Logger } from "@nestjs/common"
import { Resolver, Query, Args } from "@nestjs/graphql"
import { UpgradesService } from "./upgrades.service"
import { UpgradeEntity } from "@src/database"
import { GetUpgradesArgs } from "./upgrades.dto"

@Resolver()
export class UpgradesResolver {
    private readonly logger = new Logger(UpgradesResolver.name)

    constructor(private readonly upgradesService: UpgradesService) {}

  @Query(() => [UpgradeEntity], {
      name: "upgrades",
  })
    async getUpgrades(@Args("args") args: GetUpgradesArgs): Promise<Array<UpgradeEntity>> {
        return this.upgradesService.getUpgrades(args)
    } 
}
