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
import { envConfig } from "@src/env"
import { DeepPartial } from "@src/common"
import { StaticService } from "@src/gameplay"

@Injectable()
export class BlockchainRpcService {
    constructor(
        private readonly solanaService: SolanaService,
        @InjectMongoose()
        private readonly connection: Connection,
        @InjectCache()
        private readonly cacheManager: Cache,
        private readonly staticService: StaticService
    ) {}

    // each deployment has a different version, so we can invalidate the cache
    private version = 1

    private getCacheKey(chainKey: ChainKey, accountAddress: string, userId: string): string {
        return getCacheKey(CacheKey.BlockchainBalances, `${userId}-${accountAddress}-${chainKey}-${this.version}`)
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
        let cachedValue: DeepPartial<GetBlockchainBalancesResponse> = {}
        // if refresh is not passed, we try to get cached value
        if (refresh) {
            const isRefreshed = await this.cacheManager.get(
                this.getCacheKey(chainKey, accountAddress, userId)
            )
            if (isRefreshed) {
                const _cachedValue = await this.cacheManager.get<GetBlockchainBalancesResponse>(
                    this.getCacheKey(chainKey, accountAddress, userId)
                )
                if (_cachedValue) {
                    // if key is missing, we fetch the balances from the blockchain, 
                    cachedValue = _cachedValue
                    cached = true
                }
            } 
        } else {
            const _cachedValue = await this.cacheManager.get<GetBlockchainBalancesResponse>(
                this.getCacheKey(chainKey, accountAddress, userId)
            )
            if (_cachedValue) {
                cachedValue = _cachedValue
                cached = true
            }
        }
        // we fetch the balances from the blockchain
        const tokens: Array<TokenBalanceData> = []
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
                    if (cachedValue[tokenKey]) {
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
                this.getCacheKey(chainKey, accountAddress, userId),
                tokens,
                envConfig().blockchainRpc.dataCacheTime * 1000
            )
            await this.cacheManager.set(
                this.getCacheKey(chainKey, accountAddress, userId),
                true,
                envConfig().blockchainRpc.refreshInterval * 1000
            )
        }
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
                this.getCacheKey(chainKey, accountAddress, userId)
            )
            if (isRefreshed) {
                const _cachedValue = await this.cacheManager.get<GetBlockchainCollectionsResponse>(
                    this.getCacheKey(chainKey, accountAddress, userId)
                )
                if (_cachedValue) {
                    cachedValue = _cachedValue
                    cached = true
                }
            } 
        } else {
            const _cachedValue = await this.cacheManager.get<GetBlockchainCollectionsResponse>(
                this.getCacheKey(chainKey, accountAddress, userId)
            )
            if (_cachedValue) {
                cachedValue = _cachedValue
                cached = true
            }
        }
        // we fetch the balances from the blockchain
        const collections: Array<BlockchainCollectionData> = []
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
            for (const nftType of nftTypes) {
                const promise = async () => {
                    // if the balance is cached, we use the cached value
                    if (cachedValue[nftType]) {
                        return
                    }
                    const { nfts } = await this.solanaService.getCollection({
                        network,
                        accountAddress,
                        collectionAddress: this.staticService.nftCollections[nftType][network].collectionAddress
                    })
                    collections.push({
                        nftType,
                        nfts: nfts.map<BlockchainNFTData>((nft) => ({
                            nftAddress: nft.nftAddress,
                            name: nft.name,
                            imageUrl: nft.image,
                            description: nft.description,
                            traits: nft.attributes,
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
                this.getCacheKey(chainKey, accountAddress, userId),
                collections,
                envConfig().blockchainRpc.dataCacheTime * 1000
            )
            await this.cacheManager.set(
                this.getCacheKey(chainKey, accountAddress, userId),
                true,
                envConfig().blockchainRpc.refreshInterval * 1000
            )
        }
        // return the balances
        return {
            cached,
            collections
        }
    }
}