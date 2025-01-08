import { InjectDataSource } from "@nestjs/typeorm"
import { getPostgreSqlDataSourceName } from "./postgresql.utils"
import { PostgreSQLOptions } from "./postgresql.types"

export const InjectPostgreSQL = (options: PostgreSQLOptions = {}) => InjectDataSource(getPostgreSqlDataSourceName(options))