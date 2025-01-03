import { Logger, UseInterceptors } from "@nestjs/common"
import { Resolver, Query } from "@nestjs/graphql"
import { SystemsService } from "./systems.service"
import { Activities } from "@src/databases"
import { GraphQLCacheInterceptor } from "@src/cache"

@Resolver()
export class SystemsResolver {
    private readonly logger = new Logger(SystemsResolver.name)

    constructor(private readonly systemsService: SystemsService) {}

    @UseInterceptors(GraphQLCacheInterceptor)
    @Query(() => Activities, {
        name: "activities"
    })
    async getActivities(): Promise<Activities> {
        return this.systemsService.getActivities()
    }
}
