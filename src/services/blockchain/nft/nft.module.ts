import { Global, Module } from "@nestjs/common"
import { BlockchainNftBaseService } from "./base"
import { BlockchainNftObserverService } from "./observer"
import { IpfsService } from "./common"

@Global()
@Module({
    imports: [],
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
export class NftModule {}
