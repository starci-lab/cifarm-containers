import { Logger } from "@nestjs/common"
import { createAdapter } from "@socket.io/mongo-adapter"
import { ServerOptions } from "http"
import { MongoClient } from "mongodb"
import { IoAdapter } from "@nestjs/platform-socket.io"

const COLLECTION = "socket.io-adapter-events"

export class MongoDbIoAdapter extends IoAdapter {
    private readonly logger = new Logger(MongoDbIoAdapter.name)
    private mongoClient: MongoClient

    private adapterConstructor: ReturnType<typeof createAdapter>

    public async setClient(mongoClient: MongoClient) {
        this.mongoClient = mongoClient
    }

    public async connect(): Promise<void> {
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

