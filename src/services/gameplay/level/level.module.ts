import { Global, Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { UserEntity } from "@src/database"
import { LevelService } from "./level.service"

@Global()
@Module({
    imports: [TypeOrmModule.forFeature([UserEntity])],
    providers: [LevelService],
    exports: [LevelService]
})
export class LevelModule {}
