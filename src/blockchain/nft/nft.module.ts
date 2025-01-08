import { Module } from "@nestjs/common"
import { BlockchainNftBaseService } from "./base"
import { IpfsService } from "./common"
import { BlockchainNftObserverService } from "./observer"
import { ConfigurableModuleClass } from "./nft.module-definition"

@Module({
    providers: [
        IpfsService,
        BlockchainNftBaseService,
        BlockchainNftObserverService,
    ],
    exports: [
        IpfsService,
        BlockchainNftBaseService,
        BlockchainNftObserverService,
    ],
})
export class NftModule extends ConfigurableModuleClass {}
