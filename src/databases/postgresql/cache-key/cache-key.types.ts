import { PostgreSQLDatabase } from "@src/env"

export interface PostgreSQLCacheKeyOptions {
    //hash for pagination, which can reduce the size of the cache key, especially for large objects
    hashPagination?: boolean
    //database to use for caching
    database?: PostgreSQLDatabase
}

export enum PostgreSQLCacheKeyType {
    Id = "id", // Caching based on entity ID
    Pagination = "pagination" // Caching related to paginated data
}

export type CacheIdentifier =
    | {
          type: PostgreSQLCacheKeyType.Id
          id: string
      }
    | {
          type: PostgreSQLCacheKeyType.Pagination
          options: unknown
      }
