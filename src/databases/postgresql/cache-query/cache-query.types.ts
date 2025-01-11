import { PostgreSQLDatabase } from "@src/env"

export interface PostgreSQLCacheQueryOptions {
    //hash for pagination, which can reduce the size of the cache key, especially for large objects
    useHash?: boolean
    //database to use for caching
    database?: PostgreSQLDatabase
}