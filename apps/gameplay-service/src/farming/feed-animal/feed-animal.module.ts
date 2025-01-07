import { Global, Module } from "@nestjs/common"
import { GameplayModule } from "@src/gameplay"
import { FeedAnimalController } from "./feed-animal.controller"
import { FeedAnimalService } from "./feed-animal.service"
import { GameplayPostgreSQLModule } from "@src/databases"

@Global()
@Module({
    imports: [
        GameplayPostgreSQLModule.forFeature(),
        GameplayModule,
    ],
    controllers: [FeedAnimalController],
    providers: [FeedAnimalService],
    exports: [FeedAnimalService],
})
export class FeedAnimalModule {}
