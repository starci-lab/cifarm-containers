import { Injectable, OnModuleInit, Logger } from "@nestjs/common"
import { Connection } from "mongoose"
import { InjectMongoose, UserSchema } from "@src/databases"
import { envConfig } from "@src/env"
import { ElasticsearchService } from "@nestjs/elasticsearch"
import _ from "lodash"
import { ChangeStream } from "mongodb"
import { createIndexName } from "@src/elasticsearch"
@Injectable()
export class MongoUsersToElasticSearchService implements OnModuleInit {
    private readonly collectionName = UserSchema.name
    private readonly logger = new Logger(MongoUsersToElasticSearchService.name)
    private readonly dbName = envConfig().databases.mongo.gameplay.dbName
    private changeStream: ChangeStream
    constructor(
        @InjectMongoose()
        private readonly connection: Connection,
        private readonly elasticSearchService: ElasticsearchService
    ) {}

    async onModuleInit() {
        const indexExists = await this.elasticSearchService.indices.exists({
            index: createIndexName(this.collectionName),
        })
        if (indexExists) {
            await this.elasticSearchService.deleteByQuery({
                index: createIndexName(this.collectionName),
                query: {
                    match_all: {}
                }
            })
        } else {
            await this.elasticSearchService.indices.create({
                index: createIndexName(this.collectionName),
            })
        }
        // get the number of users in the collection
        const users = await this.connection.model<UserSchema>(UserSchema.name).find()
        const usersCount = users.length
        // split into set of 10000 users and add to elastic search
        const usersChunks = _.chunk(users, 10000)
        this.logger.log(`Found ${usersCount} users in the collection`)
        this.logger.log(`Splitting into ${usersChunks.length} chunks`)
        // check if the index exists
        for (const userChunk of usersChunks) {
            for (const user of userChunk) {
                await this.elasticSearchService.index({
                    index: createIndexName(this.collectionName),
                    id: user.id,
                    body: JSON.parse(JSON.stringify(user)),
                })
            }
        }
        this.logger.verbose("Starting to watch for changes in the collection")
        this.changeStream = this.connection.collection(this.collectionName).watch()
        this.changeStream.on("change", async (change) => {
            this.logger.verbose("Change detected:", JSON.stringify(change))
            const docId = change._id.toString()
            if (change.operationType === "insert" || change.operationType === "update") {
                const fullDoc = await this.connection.collection(this.collectionName).findOne({ _id: change._id })
                await this.elasticSearchService.index({
                    index: createIndexName(this.collectionName),
                    id: docId,
                    body: fullDoc,
                })
            } else if (change.operationType === "delete") {
                await this.elasticSearchService.delete({
                    index: createIndexName(this.collectionName),
                    id: docId,
                })
            }
        })
    }
}