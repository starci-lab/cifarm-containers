import { Logger } from "@nestjs/common"
import { Args, Query, Resolver } from "@nestjs/graphql"
import { SpinEntity } from "@src/database"
import { GetSpinsArgs } from "./"
import { SpinsService } from "./spins.service"

@Resolver()
export class SpinsResolver {
    private readonly logger = new Logger(SpinsResolver.name)

    constructor(private readonly spinsService: SpinsService) {}

    @Query(() => [SpinEntity], {
        name: "spins"
    })
    async getSpins(@Args("args") args: GetSpinsArgs): Promise<Array<SpinEntity>> {
        return this.spinsService.getSpins(args)
    }
}
