import { Provider } from "@nestjs/common"
import { getPostgreSqlToken } from "../postgresql.utils"
import { PostgreSQLJestOptions } from "./jest.types"
import { jestDataSource } from "./jest.database"

export const createPostgreSQLJestFactory = (options: PostgreSQLJestOptions): Provider => ({
    provide: getPostgreSqlToken(options.options),
    useFactory: async () => {
        return jestDataSource(options.db)
    }
})
