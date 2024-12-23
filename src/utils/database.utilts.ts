import { DataSource } from "typeorm"
import { v4 } from "uuid"

export interface CreateDatabaseParams {
    host: string
    port: number
    user: string
    pass: string
    dbName?: string
}

export const createDatabase = async ({
    host,
    pass,
    port,
    user,
    dbName = v4()
}: CreateDatabaseParams) => {
    const postgres = new DataSource({
        type: "postgres",
        host,
        port,
        username: user,
        password: pass
    })
    const dataSource = await postgres.initialize()

    //Create database
    await dataSource.createQueryRunner().createDatabase(dbName, true)
    return dataSource
}

export const deleteDatabase = async ({
    host,
    pass,
    port,
    user,
    dbName = v4()
}: CreateDatabaseParams) => {
    const postgres = new DataSource({
        type: "postgres",
        host,
        port,
        username: user,
        password: pass
    })
    const dataSource = await postgres.initialize()

    //Drop database
    await dataSource.createQueryRunner().dropDatabase(dbName, true)
}
