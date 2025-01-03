import { Logger } from "@nestjs/common"
import { Resolver, Query } from "@nestjs/graphql"
import { SystemsService } from "./systems.service"
import { Activities } from "@src/databases"

@Resolver()
export class SystemsResolver {
    private readonly logger = new Logger(SystemsResolver.name)

    constructor(private readonly systemsService: SystemsService) {}

    @Query(() => Activities, {
        name: "activities"
    })
    async getActivities(): Promise<Activities> {
        return this.systemsService.getActivities()
    }
}
