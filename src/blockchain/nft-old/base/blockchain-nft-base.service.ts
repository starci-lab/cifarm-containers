import { Injectable, Logger } from "@nestjs/common"
import {
    getNFTsByOwnerAddressParams,
    _getNFTsByOwnerAddress
} from "./get-nfts-by-owner-address"
import { getNFTsByTokenIdsParams, _getNFTsByTokenIds } from "./get-nfts-by-token-ids"
import { getNFTByTokenIdParams, _getNFTByTokenId } from "./get-nfts-by-token-id"
import { IpfsService } from "../common"
import { _mintNft, MintNftParams } from "./mint-nft.utils"
import { Network } from "@src/env"

export interface BlockchainNftBaseServiceConstructorParams {
    nftCollectionId: string
    chainKey: string
    network: Network
}

@Injectable()
export class BlockchainNftBaseService {
    private readonly logger = new Logger(BlockchainNftBaseService.name)

    constructor(private readonly ipfsService: IpfsService) {}

    public getNFTsByOwnerAddress(params: getNFTsByOwnerAddressParams) {
        return _getNFTsByOwnerAddress(params, {
            ipfsService: this.ipfsService
        })
    }

    public getNFTsByTokenIds(params: getNFTsByTokenIdsParams) {
        return _getNFTsByTokenIds(params, {
            ipfsService: this.ipfsService
        })
    }

    public getNFTByTokenId(params: getNFTByTokenIdParams) {
        return _getNFTByTokenId(params, {
            ipfsService: this.ipfsService
        })
    }

    public mintNft(params: MintNftParams) {
        return _mintNft(params)
    }
}
