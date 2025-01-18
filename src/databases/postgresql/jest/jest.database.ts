import { PostgreSQLDatabase } from "@src/env"
import { EntityManager, ObjectLiteral } from "typeorm"
import { getPostgresEntities } from "../postgresql.utils"

export interface MockedImplementations {
    findOne?: jest.Mock<ReturnType<EntityManager["findOne"]>, Parameters<EntityManager["findOne"]>>
    find?: jest.Mock<EntityManager["find"]>
    save?: jest.Mock<EntityManager["save"]>
    remove?: jest.Mock<EntityManager["remove"]>
    count?: jest.Mock<EntityManager["count"]>
    delete?: jest.Mock<EntityManager["delete"]>
}

export class MockedDb {
    private db: Record<string, ObjectLiteral> = {}
    constructor(database: PostgreSQLDatabase = PostgreSQLDatabase.Gameplay) {
        for (const entity of Object.values(getPostgresEntities(database))) {
            this.db[entity.name] = []
        }
    }

    // clear all data
    public clear() {
        this.db = {}
    }
}

export const jestDataSource = (db: MockedDb, implementations: MockedImplementations = {}) => {
    return {
        createQueryRunner: jest.fn(() => {
            // Return the query runner mock with methods
            return {
                connect: jest.fn(async () => {}),
                startTransaction: jest.fn(async () => {}),
                commitTransaction: jest.fn(async () => {}),
                rollbackTransaction: jest.fn(async () => {}),
                release: jest.fn(() => {
                    db.clear()
                }),
                manager: {
                    findOne: implementations.findOne || jest.fn(async () => {}),
                    find: implementations.find || jest.fn(async () => []),
                    save: implementations.save || jest.fn(async () => {}),
                    remove: implementations.remove || jest.fn(async () => {}),
                    count: implementations.count || jest.fn(async () => {}),
                    delete: implementations.delete || jest.fn(async () => {})
                }
            }
        })
    }
}
