import { Injectable } from "@nestjs/common"
import { SolanaService } from "@src/blockchain"
import {
    GetBlockchainBalancesRequest,
    GetBlockchainBalancesResponse,
    GetBlockchainCollectionsResponse,
    GetBlockchainCollectionsRequest,
    TokenBalanceData,
    BlockchainCollectionData,
    BlockchainNFTData
} from "./blockchain-rpc.dto"
import { UserLike } from "@src/jwt"
import { InjectMongoose, TokenKey, UserSchema } from "@src/databases"
import { Connection } from "mongoose"
import { GraphQLError } from "graphql"
import { ChainKey } from "@src/env"
import { CacheKey, getCacheKey, InjectCache } from "@src/cache"
import { Cache } from "cache-manager"
import { StaticService } from "@src/gameplay"
import { Sha256Service } from "@src/crypto"

export interface GetCacheKeyParams<T> {
    chainKey: ChainKey,
    accountAddress: string,
    userId: string
    cacheKey: CacheKey
    params: T
}
@Injectable()
export class BlockchainRpcService {
    constructor(
        private readonly solanaService: SolanaService,
        @InjectMongoose()
        private readonly connection: Connection,
        @InjectCache()
        private readonly cacheManager: Cache,
        private readonly sha256Service: Sha256Service,
        private readonly staticService: StaticService
    ) { }

    // each deployment has a different version, so we can invalidate the cache
    private version = 1

    // hash the cache key to prevent abuse
    private getCacheKey<T>({ cacheKey, chainKey, accountAddress, userId, params }: GetCacheKeyParams<T>): string {
        return this.sha256Service.hash(getCacheKey(cacheKey, `${userId}-${accountAddress}-${chainKey}-${this.version}-${JSON.stringify(params)}`))
    }

    async blockchainBalances({
        chainKey,
        accountAddress,
        tokenKeys,
        refresh,
    }: GetBlockchainBalancesRequest,
    { network, id: userId }: UserLike): Promise<GetBlockchainBalancesResponse> {
        let cached = false
        // if refresh is not passed, we try to get cached value
        let tokens: Array<TokenBalanceData> = []
        let ttl = 0
        // if refresh is not passed, we try to get cached value
        if (refresh) {
            const isRefreshed = await this.cacheManager.get(
                this.getCacheKey({ cacheKey: CacheKey.BlockchainBalancesRefreshed, chainKey, accountAddress, userId, params: { tokenKeys } })
            )
            if (isRefreshed) {
                const _cachedValue = await this.cacheManager.get<Array<TokenBalanceData>>(
                    this.getCacheKey({ cacheKey: CacheKey.BlockchainBalances, chainKey, accountAddress, userId, params: { tokenKeys } })
                )
                ttl = await this.cacheManager.ttl(
                    this.getCacheKey({ cacheKey: CacheKey.BlockchainBalancesRefreshed, chainKey, accountAddress, userId, params: { tokenKeys } })
                )
                if (_cachedValue) {
                    // if key is missing, we fetch the balances from the blockchain, 
                    tokens = _cachedValue
                    cached = true
                }
            }
        } else {
            const _cachedValue = await this.cacheManager.get<Array<TokenBalanceData>>(
                this.getCacheKey({ cacheKey: CacheKey.BlockchainBalances, chainKey, accountAddress, userId, params: { tokenKeys } })
            )
            ttl = await this.cacheManager.ttl(
                this.getCacheKey({ cacheKey: CacheKey.BlockchainBalancesRefreshed, chainKey, accountAddress, userId, params: { tokenKeys } })
            )
            if (_cachedValue) {
                tokens = _cachedValue
                cached = true
            }
        }
        // we fetch the balances from the blockchain
        const promises: Array<Promise<void>> = []
        if (network === undefined) {
            const user = await this.connection.model<UserSchema>(UserSchema.name).findById(userId)
            if (!user) {
                throw new GraphQLError("User not found", {
                    extensions: {
                        code: "USER_NOT_FOUND"
                    }
                })
            }
            network = user.network
        }
        // we fetch the balances from the blockchain
        switch (chainKey) {
        case ChainKey.Solana: {
            for (const tokenKey of tokenKeys) {
                const promise = async () => {
                    // if the balance is cached, we use the cached value
                    if (tokens.find((token) => token.tokenKey === tokenKey)) {
                        return
                    }
                    const native = (tokenKey === TokenKey.Native)
                    const tokenAddress = (!native) ? this.staticService.tokens[tokenKey][chainKey][network].tokenAddress : undefined
                    const token = await this.solanaService.getBalance({
                        network,
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
        if (!cached) {
            // we cache the balances
            await this.cacheManager.set(
                this.getCacheKey({ cacheKey: CacheKey.BlockchainBalances, chainKey, accountAddress, userId, params: { tokenKeys } }),
                tokens,
                this.staticService.blockchainDataConfigs.balances.cacheDuration * 1000
            )
            await this.cacheManager.set(
                this.getCacheKey({ cacheKey: CacheKey.BlockchainBalancesRefreshed, chainKey, accountAddress, userId, params: { tokenKeys } }),
                true,
                this.staticService.blockchainDataConfigs.balances.refreshInterval * 1000
            )
        }
        // return the balances
        return {
            cached,
            tokens,
            refreshInterval: this.getRefreshInterval(ttl)
        }
    }

    private getRefreshInterval(ttl: number): number {
        return ttl > 0 ? Math.floor((ttl - Date.now()) / 1000) : 0
    }

    async blockchainCollections({
        accountAddress,
        chainKey,
        nftCollectionKeys,
        refresh
    }: GetBlockchainCollectionsRequest,
    { network, id: userId }: UserLike): Promise<GetBlockchainCollectionsResponse> {
        let cached = false
        let collections: Array<BlockchainCollectionData> = []
        let ttl = 0
        if (refresh) {
            const isRefreshed = await this.cacheManager.get(
                this.getCacheKey({ cacheKey: CacheKey.BlockchainCollectionsRefreshed, chainKey, accountAddress, userId, params: { nftCollectionKeys } })
            )
            if (isRefreshed) {
                const _cachedValue = await this.cacheManager.get<Array<BlockchainCollectionData>>(
                    this.getCacheKey({ cacheKey: CacheKey.BlockchainCollections, chainKey, accountAddress, userId, params: { nftCollectionKeys } })
                )
                ttl = await this.cacheManager.ttl(
                    this.getCacheKey({ cacheKey: CacheKey.BlockchainCollectionsRefreshed, chainKey, accountAddress, userId, params: { nftCollectionKeys } })
                )
                if (_cachedValue) {
                    collections = _cachedValue
                    cached = true
                }
            }
        } else {
            const _cachedValue = await this.cacheManager.get<Array<BlockchainCollectionData>>(
                this.getCacheKey({ cacheKey: CacheKey.BlockchainCollections, chainKey, accountAddress, userId, params: { nftCollectionKeys } })
            )
            ttl = await this.cacheManager.ttl(
                this.getCacheKey({ cacheKey: CacheKey.BlockchainCollectionsRefreshed, chainKey, accountAddress, userId, params: { nftCollectionKeys } })
            )
            if (_cachedValue) {
                collections = _cachedValue
                cached = true
            }
        }
        // we fetch the balances from the blockchain
        const promises: Array<Promise<void>> = []
        if (network === undefined) {
            const user = await this.connection.model<UserSchema>(UserSchema.name).findById(userId)
            if (!user) {
                throw new GraphQLError("User not found", {
                    extensions: {
                        code: "USER_NOT_FOUND"
                    }
                })
            }
            network = user.network
        }
        // we fetch the balances from the blockchain
        switch (chainKey) {
        case ChainKey.Solana: {
            for (const nftCollectionKey of nftCollectionKeys) {
                const promise = async () => {
                    // if the balance is cached, we use the cached value
                    if (collections.find((collection) => collection.nftCollectionKey === nftCollectionKey)) {
                        return
                    }
                    const { nfts } = await this.solanaService.getCollection({
                        network,
                        accountAddress,
                        collectionAddress: this.staticService.nftCollections[nftCollectionKey][network].collectionAddress
                    })
                    collections.push({
                        nftCollectionKey,
                        nfts: nfts.map<BlockchainNFTData>((nft) => ({
                            nftAddress: nft.nftAddress,
                            name: nft.name,
                            imageUrl: nft.image,
                            description: nft.description,
                            attributes: nft.attributes,
                            wrapped: nft.wrapped
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
        if (!cached) {
            // we cache the balances
            await this.cacheManager.set(
                this.getCacheKey({ cacheKey: CacheKey.BlockchainCollections, chainKey, accountAddress, userId, params: { nftCollectionKeys } }),
                collections,
                this.staticService.blockchainDataConfigs.collections.cacheDuration * 1000
            )
            await this.cacheManager.set(
                this.getCacheKey({ cacheKey: CacheKey.BlockchainCollectionsRefreshed, chainKey, accountAddress, userId, params: { nftCollectionKeys } }),
                true,
                this.staticService.blockchainDataConfigs.collections.refreshInterval * 1000
            )
        }
        // return the balances
        return {
            cached,
            collections,
            // date in ms
            refreshInterval: this.getRefreshInterval(ttl)
        }
    }
}