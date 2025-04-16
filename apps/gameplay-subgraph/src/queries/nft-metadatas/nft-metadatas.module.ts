import { Module } from "@nestjs/common"
import { NFTMetadatasService } from "./nft-metadatas.service"
import { NFTMetadatasResolver } from "./nft-metadatas.resolver"

@Module({
    providers: [ NFTMetadatasService, NFTMetadatasResolver ]
})
export class NFTMetadatasModule {}
