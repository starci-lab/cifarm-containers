import { Injectable, Logger } from "@nestjs/common"
import { IoAdapter } from "./io.types"
import { createAdapter } from "@socket.io/mongo-adapter"
import { ServerOptions } from "http"
import { InjectMongoDb } from "@src/native"
import { MongoClient } from "mongodb"

const COLLECTION = "socket.io-adapter-events"

@Injectable()
export class MongoIoAdapter extends IoAdapter {
    private logger = new Logger(MongoIoAdapter.name)
    private adapterConstructor: ReturnType<typeof createAdapter>
    constructor(
        @InjectMongoDb()
        private readonly mongoClient: MongoClient,
    ) {
        super()
    }

    public async connect(): Promise<void> {
        // if cluster is not enabled, create a single connection
        await this.mongoClient.connect()
        
        // Check if the collection already exists
        const collections = await this.mongoClient.db().listCollections({ name: COLLECTION }).toArray()
    
        if (collections.length === 0) {
        // Collection does not exist, create it
            await this.mongoClient.db().createCollection(COLLECTION, {
                capped: true,
                size: 1e7 // 10MB
            })
            this.logger.debug(`Collection ${COLLECTION} created successfully.`)
        } else {
        // Collection already exists
            this.logger.debug(`Collection ${COLLECTION} already exists.`)
        }
        
        const mongoCollection = this.mongoClient.db().collection(COLLECTION)
        this.adapterConstructor = createAdapter(mongoCollection)
    }

    public createIOServer(port: number, options?: ServerOptions) {
        const server = super.createIOServer(port, options)
        server.adapter(this.adapterConstructor)
        return server
    }
}

