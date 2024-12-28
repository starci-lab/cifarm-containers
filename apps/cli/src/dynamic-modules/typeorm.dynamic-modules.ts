import { TypeOrmModule } from "@nestjs/typeorm"
import { ConfigEntity, GameplayPostgreSQLEntity } from "../sqlite/entities"

export const typeOrmForRoot = () => TypeOrmModule.forRoot({
    type: "sqlite",
    database: "db.sqlite",
    autoLoadEntities: true,
    synchronize: true,
})

export const typeOrmForFeature = () => TypeOrmModule.forFeature([
    GameplayPostgreSQLEntity,
    ConfigEntity
])