import { SetMetadata } from "@nestjs/common"
import { GRAPHQL_CACHE_TTL } from "./types"

// default ttl is 1 day
export const GraphQLCacheTTL = (ttl: number = 60 * 60 * 24) => SetMetadata(GRAPHQL_CACHE_TTL, ttl)