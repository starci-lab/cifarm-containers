import { Provider } from "@nestjs/common"
import { getPostgresEntities, getPostgreSqlToken } from "../postgresql.utils"
import { DataSource } from "typeorm"
import { DataType, newDb } from "pg-mem"
import { PostgreSQLMemoryOptions } from "./memory.types"
import { v4 } from "uuid"

export const createPostgreSQLMemoryProvider = (
    options: PostgreSQLMemoryOptions = {}
): Provider => {
    return {
        provide: getPostgreSqlToken(options),
        useFactory: async (): Promise<DataSource> => {
            const db = newDb({
                // Recommanded when using Typeorm .synchronize(), which creates foreign keys but not indices !
                autoCreateForeignKeyIndices: true
            })

            db.public.registerFunction({
                name: "current_database",
                args: [],
                returns: DataType.text,
                implementation: (x) => `hello world: ${x}`
            })
          
            db.public.registerFunction({
                name: "version",
                args: [],
                returns: DataType.text,
                implementation: (x) => `hello world: ${x}`
            })
          
            db.registerExtension("uuid-ossp", (schema) => {
                schema.registerFunction({
                    name: "uuid_generate_v4",
                    returns: DataType.uuid,
                    implementation: v4,
                    impure: true
                })
            })
              
            const dataSource: DataSource = await db.adapters.createTypeormDataSource({
                type: "postgres",
                entities: getPostgresEntities(options.database),
            })

            await dataSource.initialize()
            await dataSource.synchronize()
            
            return dataSource
        }
    }
}
