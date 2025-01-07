import { Module } from "@nestjs/common"
import { FollowController } from "./follow.controller"
import { FollowService } from "./follow.service"
import { GameplayPostgreSQLModule } from "@src/databases"

@Module({
    imports: [ GameplayPostgreSQLModule.forFeature() ],
    controllers: [FollowController],
    providers: [FollowService],
    exports: [FollowService]
})
export class FollowModule {}
