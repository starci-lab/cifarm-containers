import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { ConfigEntity, GameplayDatabaseEntity } from "./entities"
import { join } from "path"

@Module({
    imports: [
        TypeOrmModule.forRoot({
            type: "sqlite",
            database: join(__dirname,"db.sqlite"),
            autoLoadEntities: true,
            synchronize: true,
        }),
        TypeOrmModule.forFeature([
            ConfigEntity,
            GameplayDatabaseEntity
        ]),
    ] 
})
export class SqliteModule {}