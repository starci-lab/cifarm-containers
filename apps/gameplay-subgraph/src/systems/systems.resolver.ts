import { Logger } from "@nestjs/common"
import { Resolver, Query, Args } from "@nestjs/graphql"
import { SystemsService } from "./systems.service"
import { SystemEntity } from "@src/database"
import { GetSystemsArgs } from "./"

@Resolver()
export class SystemsResolver {
    private readonly logger = new Logger(SystemsResolver.name)

    constructor(private readonly systemsService: SystemsService) {}

    @Query(() => [SystemEntity], {
        name: "systems"
    })
    async getSystems(@Args("args") args: GetSystemsArgs): Promise<Array<SystemEntity>> {
        return this.systemsService.getSystems(args)
    }

     @Query(() => SystemEntity, {
         name: "system",
         nullable:true
     })
    async getSystemById(@Args("id") id: string): Promise<SystemEntity | null> {
        this.logger.debug(`getSystemById: id=${id}`)
        return this.systemsService.getSystemById(id)
    }
}
