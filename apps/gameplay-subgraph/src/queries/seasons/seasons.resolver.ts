import { Logger, UseGuards } from "@nestjs/common"
import { Args, ID, Query, Resolver } from "@nestjs/graphql"
import { SeasonSchema, SeasonId } from "@src/databases"
import { SeasonsService } from "./seasons.service"
import { GraphQLThrottlerGuard } from "@src/throttler"

@Resolver()
export class SeasonsResolver {
    private readonly logger = new Logger(SeasonsResolver.name)

    constructor(private readonly seasonsService: SeasonsService) {}

    
    @UseGuards(GraphQLThrottlerGuard)
    @Query(() => [SeasonSchema], {
        name: "seasons",
        description: "Get all seasons"
    })
    seasons(): Array<SeasonSchema> {
        return this.seasonsService.seasons()
    }

    
    @UseGuards(GraphQLThrottlerGuard)
    @Query(() => SeasonSchema, {
        name: "season",
        description: "Get a season by ID"
    })
    season(
        @Args("id", { type: () => ID, description: "The ID of the season" }) id: SeasonId
    ): SeasonSchema {
        return this.seasonsService.season(id)
    }

    @UseGuards(GraphQLThrottlerGuard)
    @Query(() => SeasonSchema, {
        name: "activeSeason",
        description: "Get the active season"
    })
    activeSeason(): SeasonSchema {
        return this.seasonsService.activeSeason()
    }
}