import { Inject, Injectable, Logger } from "@nestjs/common"
import { HealthIndicator } from "@nestjs/terminus"
import { MODULE_OPTIONS_TOKEN } from "./mongodb.module-definition"
import { MongoDbHealthOptions } from "./mongodb.types"
import { MongoDatabase } from "@src/env"
import { MongoClient } from "mongodb"
import { createMongoDbUri } from "@src/native"

@Injectable()
export class MongoDbHealthIndicator extends HealthIndicator {
    private readonly logger = new Logger(MongoDbHealthIndicator.name)
    private readonly database: MongoDatabase
    constructor(
        @Inject(MODULE_OPTIONS_TOKEN)
        private readonly options: MongoDbHealthOptions
    ) {
        super()
        this.database = options.database || MongoDatabase.Adapter
    }

    public async check(key?: string) {
        key = key || this.database
        // Replace with the actual check
        let isHealthy = false
        const mongoClient = new MongoClient(createMongoDbUri(this.database))
        try {
            await mongoClient.connect()
            isHealthy = true
        } catch (error) {
            this.logger.error(error)
        } finally {
            await mongoClient.close()
        }
        return super.getStatus(key, isHealthy, { message: "MongoDB is up and running" })
    }
}
