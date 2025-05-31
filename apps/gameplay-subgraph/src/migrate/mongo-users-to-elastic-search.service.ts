import { Injectable, OnModuleInit, Logger } from "@nestjs/common"
import { Connection } from "mongoose"
import { InjectMongoose, UserSchema } from "@src/databases"
import { ElasticsearchService } from "@nestjs/elasticsearch"
import _ from "lodash"
import { ChangeStream, ChangeStreamDocument } from "mongodb"
import { createIndexName } from "@src/elasticsearch"

@Injectable()
export class MongoUsersToElasticSearchService implements OnModuleInit {
    private readonly collectionName = UserSchema.name
    private readonly logger = new Logger(MongoUsersToElasticSearchService.name)
    private changeStream: ChangeStream
    constructor(
        @InjectMongoose()
        private readonly connection: Connection,
        private readonly elasticSearchService: ElasticsearchService
    ) {}

    async onModuleInit() {
        try {
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
                    const userObject = user.toJSON()
                    delete userObject._id
                    await this.elasticSearchService.index({
                        index: createIndexName(this.collectionName),
                        id: user._id.toString(),
                        body: userObject as unknown as Record<string, string>,
                    })
                }
            }
            this.logger.verbose("Starting to watch for changes in the collection")
            this.changeStream = this.connection.model<UserSchema>(UserSchema.name).watch()
            this.changeStream.on("change", async (change: ChangeStreamDocument<UserSchema>) => {
                try {
                    this.logger.warn("Change detected:", JSON.stringify(change))
                    if (change.operationType === "insert" || change.operationType === "update") {
                        const user = change.fullDocument
                        const userObject = _.cloneDeep(user)
                        delete userObject._id
                        await this.elasticSearchService.index({
                            index: createIndexName(this.collectionName),
                            id: user._id.toString(),
                            body: userObject as unknown as Record<string, string>,
                        })
                    } else if (change.operationType === "delete") {
                        await this.elasticSearchService.delete({
                            index: createIndexName(this.collectionName),
                            id: (change.documentKey._id as string).toString(),
                        })
                    }
                } catch (error) {
                    this.logger.error("Error processing change:", error)
                }
            })
        } catch (error) {
            this.logger.error("Error initializing module:", error)
        }
    }
}