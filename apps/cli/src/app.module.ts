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

@Module({
    imports: [
        EnvModule.forRoot(),
        BlockchainModule.register({
            isGlobal: true
        }),
        BaseHoneycombModule.register({
            isGlobal: true,
            useGlobalImports: true,
        }), 
        ExecModule.register({
            docker: {
                core: true
            },
            isGlobal: true
        }),
        FarcasterCoreModule.register({
            isGlobal: true
        }),
        FarcasterModule,
        DatabaseModule,
        DockerModule,
        HoneycombModule,
        NFTModule
    ]
})
export class AppModule {}