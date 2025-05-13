import { Module } from "@nestjs/common"
import { ThrottlerModule } from "@nestjs/throttler"
import { GoogleCloudModule } from "@src/google-cloud"
import { MongooseModule } from "@src/databases"
import { IdModule } from "@src/id"
import { XApiModule } from "@src/x-api"
import { FacebookModule as FacebookCoreModule } from "@src/facebook"
import { AuthModule } from "./auth"

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
        FacebookCoreModule.register({
            isGlobal: true
        }),
        XApiModule.register({
            isGlobal: true
        }),
        AuthModule
    ],
})
export class AppModule {}
