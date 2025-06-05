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
    ) { }

    async onModuleInit() {
        try {
            // delete the old index to avoid conflicts
            const indexExists = await this.elasticSearchService.indices.exists({
                index: createIndexName(this.collectionName),
            })
            if (indexExists) {
                await this.elasticSearchService.indices.delete({
                    index: createIndexName(this.collectionName),
                })
            }
            await this.elasticSearchService.indices.create({
                index: createIndexName(this.collectionName),
            })
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
                    const raw = user.toJSON()
                    const userObject = _.pickBy(raw, (value) => value !== null && value !== undefined) as typeof raw
                    userObject.followeeUserIds = userObject.followeeUserIds || []
                    await this.elasticSearchService.index({
                        index: createIndexName(this.collectionName),
                        id: userObject.id,
                        body: userObject as unknown as Record<string, string>,
                    })
                }
            }
            this.logger.verbose("Starting to watch for changes in the collection")
            this.changeStream = this.connection.model<UserSchema>(UserSchema.name).watch()
            this.changeStream.on("change", async (change: ChangeStreamDocument<UserSchema>) => {
                try {
                    if (change.operationType === "insert") {
                        this.logger.warn(JSON.stringify(change))
                        const user = change.fullDocument
                        const userObject = _.cloneDeep(user)
                        userObject.id = userObject._id.toString()
                        delete userObject._id
                        userObject.followeeUserIds = userObject.followeeUserIds || []
                        await this.elasticSearchService.index({
                            index: createIndexName(this.collectionName),
                            id: userObject.id,
                            body: userObject as unknown as Record<string, string>,
                        })
                    } else if (change.operationType === "update") {
                        await this.elasticSearchService.update<UserSchema>({
                            index: createIndexName(this.collectionName),
                            id: change.documentKey._id,
                            doc: change.updateDescription.updatedFields,
                            retry_on_conflict: 20,
                        })
                    } else if (change.operationType === "delete") {
                        await this.elasticSearchService.delete({
                            index: createIndexName(this.collectionName),
                            id: change.documentKey._id,
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