import { Module } from "@nestjs/common"
import { EnvModule } from "@src/env"
import { DatabaseModule } from "./database"
import { ExecModule } from "@src/exec"
import { DockerModule } from "./docker/docker.module"
import { HoneycombModule } from "./honeycomb"
import { BlockchainModule } from "@src/blockchain"
import { HoneycombModule as BaseHoneycombModule } from "@src/honeycomb"
import { NFTModule } from "./nft"
import { FarcasterModule as FarcasterCoreModule } from "@src/farcaster"
import { FarcasterModule } from "./farcaster"
import { S3Module } from "@src/s3"
import { CryptoModule } from "@src/crypto"
import { EncryptModule } from "./encrypt"
import { MongooseModule } from "@src/databases"
import { GoogleCloudModule } from "@src/google-cloud"
import { HttpModule } from "@nestjs/axios"
import { GameplayModule } from "@src/gameplay"
@Module({
    imports: [
        EnvModule.forRoot(),
        S3Module.register({
            isGlobal: true
        }),
        BlockchainModule.register({
            isGlobal: true
        }),
        MongooseModule.forRoot(),
        BaseHoneycombModule.register({
            isGlobal: true,
            useGlobalImports: true,
        }), 
        GoogleCloudModule.register({
            isGlobal: true
        }),
        GameplayModule.register({
            isGlobal: true
        }),
        ExecModule.register({
            isGlobal: true,
            docker: {
                core: true
            }
        }),
        HttpModule.register({
            global: true
        }),
        FarcasterCoreModule.register({
            isGlobal: true
        }),
        CryptoModule.register({
            isGlobal: true
        }),
        EncryptModule,
        FarcasterModule,
        DatabaseModule,
        DockerModule,
        HoneycombModule,
        NFTModule
    ]
})
export class AppModule {}