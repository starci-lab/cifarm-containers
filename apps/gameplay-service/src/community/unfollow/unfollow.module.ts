import { Module } from "@nestjs/common"
import { UnfollowController } from "./unfollow.controller"
import { UnfollowService } from "./unfollow.service"
import { GameplayPostgreSQLModule } from "@src/databases"

@Module({
    imports: [GameplayPostgreSQLModule.forRoot()],
    controllers: [UnfollowController],
    providers: [UnfollowService],
    exports: [UnfollowService]
})
export class UnfollowModule {}
