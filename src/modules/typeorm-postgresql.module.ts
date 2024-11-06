import { TypeOrmModule } from "@nestjs/typeorm"
import { envConfig } from "@src/config"

export const typeOrmGameplayPostgresqlModule = TypeOrmModule.forRoot({
    type: "postgres",
    host: envConfig().database.postgres.gameplay.host,
    port: envConfig().database.postgres.gameplay.port,
    username: envConfig().database.postgres.gameplay.user,
    password: envConfig().database.postgres.gameplay.pass,
    database: envConfig().database.postgres.gameplay.dbName,    
    autoLoadEntities: true,
    synchronize: true,
})