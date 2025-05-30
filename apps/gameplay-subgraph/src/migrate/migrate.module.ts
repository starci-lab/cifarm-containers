import { Module } from "@nestjs/common"
import { MongoUsersToElasticSearchService } from "./mongo-users-to-elastic-search.service"

@Module({
    providers: [
        MongoUsersToElasticSearchService
    ],
})
export class MigrateModule {}