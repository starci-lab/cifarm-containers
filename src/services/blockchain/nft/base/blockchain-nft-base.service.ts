import { Injectable, Logger } from "@nestjs/common"
import {
    GetNftsByOwnerAddressParams,
    _getNftsByOwnerAddress,
} from "./get-nfts-by-owner-address.base"
import { Network } from "@/config"
import {
    GetNftsByTokenIdsParams,
    _getNftsByTokenIds,
} from "./get-nfts-by-token-ids.base"
import { GetNftByTokenIdParams, _getNftByTokenId } from "./get-nfts-by-token-id.base"
import { IpfsService } from "../common"
import { _mintNft, MintNftParams } from "./mint-nft.base"

export interface BlockchainNftBaseServiceConstructorParams {
  nftCollectionId: string;
  chainKey: string;
  network: Network;
}

@Injectable()
export class BlockchainNftBaseService {
    private readonly logger = new Logger(BlockchainNftBaseService.name)

    constructor(
        private readonly ipfsService: IpfsService,
    ) {
    }

    public getNftsByOwnerAddress(params: GetNftsByOwnerAddressParams) {
        return _getNftsByOwnerAddress(params, {
            ipfsService: this.ipfsService,

        })
    }

    public getNftsByTokenIds(params: GetNftsByTokenIdsParams) {
        return _getNftsByTokenIds(params, {
            ipfsService: this.ipfsService,
        })
    }

    public getNftByTokenId(params: GetNftByTokenIdParams) {
        return _getNftByTokenId(params, {
            ipfsService: this.ipfsService,
        })
    }

    public mintNft(params: MintNftParams) {
        return _mintNft(params)
    }
}
