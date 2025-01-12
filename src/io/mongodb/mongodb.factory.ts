import { INestApplication, Injectable } from "@nestjs/common"
import { InjectMongoDb } from "@src/native"
import { MongoClient } from "mongodb"
import { MongoDbIoAdapter } from "./mongodb.adapter"
import { MongoDatabase } from "@src/env"
import { IoAdapterFactory } from "../io.types"

@Injectable()
export class MongoDbIoAdapterFactory implements IoAdapterFactory {
    constructor(
        @InjectMongoDb(MongoDatabase.Adapter)
        private readonly mongoClient: MongoClient,
    ) {}

    public createAdapter(app: INestApplication) {
        const adapter = new MongoDbIoAdapter(app)
        adapter.setClient(this.mongoClient)
        return adapter
    }
}