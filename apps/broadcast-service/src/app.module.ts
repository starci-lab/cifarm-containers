import { Module } from "@nestjs/common"
import { BroadcastPlacedItemsModule } from "./broadcast-placed-items"
import { TypeOrmModule } from "@nestjs/typeorm"

@Module({
    imports: [
        TypeOrmModule.forRoot({
            type: "postgres",
            host: "localhost",
            port: 5432,
            username: "postgres",
            password: "Cuong123_A",
            database: "cifarm",
            autoLoadEntities: true,
            synchronize: true,
        }),
        BroadcastPlacedItemsModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}
