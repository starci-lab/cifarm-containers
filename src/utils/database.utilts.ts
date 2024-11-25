import { DataSource } from "typeorm"
import { v4 } from "uuid"

export type DbType = "postgres"

export interface CreateDatabaseParams<DbType> {
    type: DbType
    host: string
    port: number
    user: string
    pass: string
    dbName?: string
}

export const createDatabase = async <DbType>({
    host,
    pass,
    port,
    type,
    user,
    dbName = v4()
}: CreateDatabaseParams<DbType>) => {
    console.log("Creating database:", {
        host,
        pass,
        port,
        type,
        user,
        dbName
    })
    const postgres = new DataSource({
        type: type as unknown as "postgres",
        host,
        port,
        username: user,
        password: pass
    })
    const dataSource = await postgres.initialize()

    //Create database
    await dataSource.createQueryRunner().createDatabase(dbName, true)
}

export const deleteDatabase = async <DbType>({
    host,
    pass,
    port,
    type,
    user,
    dbName = v4()
}: CreateDatabaseParams<DbType>) => {
    const postgres = new DataSource({
        type: type as unknown as "postgres",
        host,
        port,
        username: user,
        password: pass
    })
    const dataSource = await postgres.initialize()

    //Drop database
    await dataSource.createQueryRunner().dropDatabase(dbName, true)
}
