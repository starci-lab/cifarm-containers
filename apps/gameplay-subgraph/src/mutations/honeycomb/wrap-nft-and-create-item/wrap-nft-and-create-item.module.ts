import { Module } from "@nestjs/common"
import { WrapNFTAndCreateItemService } from "./wrap-nft-and-create-item.service"
import { WrapNFTAndCreateItemResolver } from "./wrap-nft-and-create-item.resolver"

@Module({
    imports: [],
    providers: [WrapNFTAndCreateItemService, WrapNFTAndCreateItemResolver],
})
export class WrapNFTAndCreateItemModule {}
