import { Injectable } from "@nestjs/common"
import { SolanaService } from "@src/blockchain"
import { GetBlockchainBalancesRequest, GetBlockchainBalancesResponse, GetBlockchainCollectionsResponse, GetBlockchainCollectionsRequest, TokenBalanceData, BlockchainCollectionData, BlockchainNFTData } from "./blockchain.dto"
import { UserLike } from "@src/jwt"
import { InjectMongoose, TokenKey, UserSchema } from "@src/databases"
import { Connection } from "mongoose"
import { GraphQLError } from "graphql"
import { ChainKey, Network } from "@src/env"
import { CacheKey, getCacheKey, InjectCache } from "@src/cache"
import { Cache } from "cache-manager"
import { envConfig } from "@src/env"
import { DeepPartial } from "@src/common"
import { StaticService } from "@src/gameplay"

@Injectable()
export class BlockchainService {
    constructor(
        private readonly solanaService: SolanaService,
        @InjectMongoose()
        private readonly connection: Connection,
        @InjectCache()
        private readonly cacheManager: Cache,
        private readonly staticService: StaticService
    ) {}

    async blockchainBalances({
        chainKey,
        accountAddress,
        tokenKeys,
        refresh,
    }: GetBlockchainBalancesRequest,
    { network, id: userId }: UserLike): Promise<GetBlockchainBalancesResponse> {
        let cached = false
        // if refresh is not passed, we try to get cached value
        let cachedValue: DeepPartial<GetBlockchainBalancesResponse> = {}
        // if refresh is not passed, we try to get cached value
        if (refresh) {
            const isRefreshed = await this.cacheManager.get(
                getCacheKey(CacheKey.BlockchainBalancesRefreshed, userId)
            )
            if (isRefreshed) {
                const _cachedValue = await this.cacheManager.get<GetBlockchainBalancesResponse>(
                    getCacheKey(CacheKey.BlockchainBalances, userId)
                )
                if (_cachedValue) {
                    // if key is missing, we fetch the balances from the blockchain, 
                    cachedValue = _cachedValue
                    cached = true
                }
            } 
        } else {
            const _cachedValue = await this.cacheManager.get<GetBlockchainBalancesResponse>(
                getCacheKey(CacheKey.BlockchainBalances, userId)
            )
            if (_cachedValue) {
                cachedValue = _cachedValue
                cached = true
            }
        }
        // we fetch the balances from the blockchain
        const tokens: Array<TokenBalanceData> = []
        const promises: Array<Promise<void>> = []
        let _network: Network
        if (network === undefined) {
            const user = await this.connection.model<UserSchema>(UserSchema.name).findById(userId)
            if (!user) {
                throw new GraphQLError("User not found", {
                    extensions: {
                        code: "USER_NOT_FOUND"
                    }
                })
            }
            _network = user.network
        }
        // we fetch the balances from the blockchain
        switch (chainKey) {
        case ChainKey.Solana: {
            for (const tokenKey of tokenKeys) {
                const promise = async () => {
                    // if the balance is cached, we use the cached value
                    if (cachedValue[tokenKey]) {
                        return
                    }
                    const native = (tokenKey === TokenKey.Native)
                    const tokenAddress = (!native) ? this.staticService.tokens[tokenKey][chainKey][_network].tokenAddress : undefined
                    const token = await this.solanaService.getBalance({
                        network: _network,
                        accountAddress,
                        tokenAddress,
                        native
                    })
                    tokens.push({
                        tokenKey,
                        balance: token.balance
                    })
                }
                promises.push(promise())
            }
            await Promise.all(promises)
            break
        }
        default: {
            throw new GraphQLError("Unsupported chain key", {
                extensions: {
                    code: "UNSUPPORTED_CHAIN_KEY",
                }
            })
        }
        }
        // we cache the balances
        await this.cacheManager.set(
            getCacheKey(CacheKey.BlockchainBalances, userId),
            tokens,
            envConfig().blockchainRpc.dataCacheTime * 1000
        )
        await this.cacheManager.set(
            getCacheKey(CacheKey.BlockchainBalancesRefreshed, userId),
            true,
            envConfig().blockchainRpc.refreshInterval * 1000
        )
        // return the balances
        return {
            cached,
            tokens
        }
    }

    async blockchainCollections({
        accountAddress,
        chainKey,
        nftTypes,
        refresh 
    }: GetBlockchainCollectionsRequest,
    { network, id: userId }: UserLike): Promise<GetBlockchainCollectionsResponse> {
        let cached = false
        let cachedValue: DeepPartial<GetBlockchainCollectionsResponse> = {}
        if (refresh) {
            const isRefreshed = await this.cacheManager.get(
                getCacheKey(CacheKey.BlockchainCollectionsRefreshed, userId)
            )
            if (isRefreshed) {
                const _cachedValue = await this.cacheManager.get<GetBlockchainCollectionsResponse>(
                    getCacheKey(CacheKey.BlockchainCollections, userId)
                )
                if (_cachedValue) {
                    cachedValue = _cachedValue
                    cached = true
                }
            } 
        } else {
            const _cachedValue = await this.cacheManager.get<GetBlockchainCollectionsResponse>(
                getCacheKey(CacheKey.BlockchainCollections, userId)
            )
            if (_cachedValue) {
                cachedValue = _cachedValue
                cached = true
            }
        }
        // we fetch the balances from the blockchain
        const collections: Array<BlockchainCollectionData> = []
        const promises: Array<Promise<void>> = []
        let _network: Network
        if (network === undefined) {
            const user = await this.connection.model<UserSchema>(UserSchema.name).findById(userId)
            if (!user) {
                throw new GraphQLError("User not found", {
                    extensions: {
                        code: "USER_NOT_FOUND"
                    }
                })
            }
            _network = user.network
        }
        // we fetch the balances from the blockchain
        switch (chainKey) {
        case ChainKey.Solana: {
            for (const nftType of nftTypes) {
                const promise = async () => {
                    // if the balance is cached, we use the cached value
                    if (cachedValue[nftType]) {
                        return
                    }
                    const { nfts } = await this.solanaService.getCollection({
                        network: _network,
                        accountAddress,
                        collectionAddress: this.staticService.nftCollections[nftType][_network].collectionAddress
                    })
                    collections.push({
                        nftType,
                        nfts: nfts.map<BlockchainNFTData>((nft) => ({
                            nftAddress: nft.nftAddress,
                            name: nft.name,
                            imageUrl: nft.image,
                            description: nft.description,
                            traits: nft.attributes,
                        }))
                    })
                }
                promises.push(promise())
            }
            await Promise.all(promises)
            break
        }
        default: {
            throw new GraphQLError("Unsupported chain key", {
                extensions: {
                    code: "UNSUPPORTED_CHAIN_KEY",
                }
            })
        }
        }
        // we cache the balances
        await this.cacheManager.set(
            getCacheKey(CacheKey.BlockchainCollections, userId),
            collections,
            envConfig().blockchainRpc.dataCacheTime * 1000
        )
        await this.cacheManager.set(
            getCacheKey(CacheKey.BlockchainCollectionsRefreshed, userId),
            true,
            envConfig().blockchainRpc.refreshInterval * 1000
        )
        // return the balances
        return {
            cached,
            collections
        }
    }
}