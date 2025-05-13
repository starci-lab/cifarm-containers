import { Module } from "@nestjs/common"
import { ThrottlerModule } from "@nestjs/throttler"
import { GoogleCloudModule } from "@src/google-cloud"
import { MongooseModule } from "@src/databases"
import { GoogleModule } from "./google"
import { IdModule } from "@src/id"
import { XApiModule } from "@src/x-api"
import { XModule } from "./x"

@Module({
    imports: [
        MongooseModule.forRoot(),
        ThrottlerModule.forRoot(),
        IdModule.register({
            name: "Social Auth",
            isGlobal: true
        }),
        GoogleCloudModule.register({
            isGlobal: true
        }),
        XApiModule.register({
            isGlobal: true
        }),
        GoogleModule,
        XModule
    ],
})
export class AppModule {}
