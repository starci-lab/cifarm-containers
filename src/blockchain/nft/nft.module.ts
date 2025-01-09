import { DynamicModule, Module } from "@nestjs/common"
import { BlockchainNftBaseService } from "./base"
import { IpfsService } from "./common"
import { BlockchainNftObserverService } from "./observer"
import { ConfigurableModuleClass, OPTIONS_TYPE } from "./nft.module-definition"

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
export class NftModule extends ConfigurableModuleClass {
    static register(options: typeof OPTIONS_TYPE = {}) : DynamicModule {
        return super.register(options)
    }
}
