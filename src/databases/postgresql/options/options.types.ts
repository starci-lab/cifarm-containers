import { BaseOptionsOptions } from "@src/common"
import { PostgreSQLOptions } from "../postgresql.types"

export interface PostgreSQLOptionsOptions extends BaseOptionsOptions<PostgreSQLOptions> {
    injectionToken?: string
}