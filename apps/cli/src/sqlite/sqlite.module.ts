import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { ConfigEntity, GameplayDataSourceEntity } from "./entities"

@Module({
    imports: [
        TypeOrmModule.forRoot({
            type: "sqlite",
            database: "db.sqlite",
            autoLoadEntities: true,
            synchronize: true,
        }),
        TypeOrmModule.forFeature([
            ConfigEntity,
            GameplayDataSourceEntity
        ]),
    ] 
})
export class SqliteModule {}