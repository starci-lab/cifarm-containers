import { TypeOrmModule } from "@nestjs/typeorm"

export const typeOrmGameplayPostgresqlModule = TypeOrmModule.forRoot({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "postgres",
    password: "Cuong123_A",
    database: "cifarm",
    autoLoadEntities: true,
    synchronize: true,
})