import { Inject, Injectable, Logger, OnModuleInit } from "@nestjs/common"
import { ModuleRef } from "@nestjs/core"
import { HealthIndicator } from "@nestjs/terminus"
import { MODULE_OPTIONS_TOKEN } from "./mongodb.module-definition"
import { MongoDbHealthOptions } from "./mongodb.types"
import { MongoDatabase } from "@src/env"
import { MongoClient } from "mongodb"
import { getMongoDbToken } from "@src/native"

@Injectable()
export class MongoDbHealthIndicator extends HealthIndicator implements OnModuleInit {
    private readonly logger = new Logger(MongoDbHealthIndicator.name)
    private readonly database: MongoDatabase
    private mongoClient: MongoClient
    constructor(
        private readonly moduleRef: ModuleRef,
        @Inject(MODULE_OPTIONS_TOKEN)
        private readonly options: MongoDbHealthOptions
    ) {
        super()
        this.database = options.database || MongoDatabase.Adapter
    }

    onModuleInit() {
        this.mongoClient = this.moduleRef.get<MongoClient>(getMongoDbToken(this.database), { strict: false })
    }

    public async check(key?: string) {
        key = key || this.database
        // Replace with the actual check
        let isHealthy = false
        try {
            await this.mongoClient.connect()
            isHealthy = true
        } catch (error) {
            this.logger.error(error)
        }
        return super.getStatus(key, isHealthy, { message: "MongoDB is up and running" })
    }
}
