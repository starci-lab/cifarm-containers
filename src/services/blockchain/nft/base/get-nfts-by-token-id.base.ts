import { Contract, JsonRpcProvider } from "ethers"
import {
    algorandAlgodClient,
    algorandIndexerClient,
    aptosClient,
    evmHttpRpcUrl,
    nearClient,
    polkadotUniqueNetworkSdkClient,
    solanaHttpRpcUrl,
} from "../../rpcs"
import { fetchDigitalAsset } from "@metaplex-foundation/mpl-token-metadata"
import { publicKey } from "@metaplex-foundation/umi"
import { Connection, PublicKey, ParsedAccountData } from "@solana/web3.js"
import { erc721Abi } from "../../abis"
import {
    Network,
    Platform,
    blockchainConfig,
    chainKeyToPlatform,
} from "@/config"
import { PlatformNotFoundException } from "@/exceptions"
import { MulticallProvider } from "@ethers-ext/provider-multicall"
import { NearNft, NftData } from "../common"
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults"
import { Atomic } from "@/utils"
import { IpfsService } from "../common"

export interface GetNftByTokenIdParams {
  tokenId: string;
  nftCollectionKey: string;
  chainKey: string;
  network: Network;
}

//services from dependency injection
export interface GetNftByTokenIdServices {
  ipfsService?: IpfsService;
}

export const _getEvmNftByTokenId = async (
    { nftCollectionKey, chainKey, network, tokenId }: GetNftByTokenIdParams,
    { ipfsService }: GetNftByTokenIdServices,
): Promise<NftData> => {
    const nftCollectionId =
    blockchainConfig()[chainKey].nftCollections[nftCollectionKey][network]
        .collectionId

    const rpc = evmHttpRpcUrl(chainKey, network)
    const provider = new JsonRpcProvider(rpc)
    const multicaller = new MulticallProvider(provider)
    const multicallerContract = new Contract(
        nftCollectionId,
        erc721Abi,
        multicaller,
    )

    const [ownerAddress, tokenURI] = await Promise.all([
        multicallerContract.getFunction("ownerOf").staticCall(tokenId),
        multicallerContract.getFunction("tokenURI").staticCall(tokenId),
    ])

    const metadata = await ipfsService.getRawContent(tokenURI)
    return {
        ownerAddress,
        tokenId,
        metadata: {
            image: metadata.image,
            properties: metadata.properties,
        },
    }
}

export const _getSolanaNftByTokenId = async (
    { chainKey, network, tokenId }: GetNftByTokenIdParams,
    { ipfsService }: GetNftByTokenIdServices,
): Promise<NftData> => {
    const rpc = solanaHttpRpcUrl(chainKey, network)
    const connection = new Connection(rpc, "confirmed")
    const umi = createUmi(rpc)
    const [largestAccounts, digitalAsset] = await Promise.all([
        connection.getTokenLargestAccounts(new PublicKey(tokenId)),
        fetchDigitalAsset(umi, publicKey(tokenId)),
    ])
    const largestAccountInfo = await connection.getParsedAccountInfo(
        largestAccounts.value[0].address,
    )
    const metadata = await ipfsService.getRawContent(digitalAsset.metadata.uri)
    return {
        ownerAddress: (largestAccountInfo.value.data as ParsedAccountData).parsed
            .info.owner,
        tokenId,
        metadata: {
            image: metadata.image,
            properties: metadata.properties,
        },
    }
}

export const _getAptosNftByTokenId = async (
    { network, tokenId }: GetNftByTokenIdParams,
    { ipfsService }: GetNftByTokenIdServices,
): Promise<NftData> => {
    const client = aptosClient(network)

    const [digitalAsset, ownership] = await Promise.all([
        client.getDigitalAssetData({
            digitalAssetAddress: tokenId,
        }),
        client.getCurrentDigitalAssetOwnership({
            digitalAssetAddress: tokenId,
        }),
    ])

    const metadata = await ipfsService.getRawContent(digitalAsset.token_uri)
    return {
        ownerAddress: ownership.owner_address,
        tokenId,
        metadata: {
            image: metadata.image,
            properties: metadata.properties,
        },
    }
}

export const _getAlgorandNftByTokenId = async (
    { network, tokenId }: GetNftByTokenIdParams,
    { ipfsService }: GetNftByTokenIdServices,
): Promise<NftData> => {
    const indexerClient = algorandIndexerClient(network)
    const algodClient = algorandAlgodClient(network)
    try {
        const { balances } = await indexerClient
            .lookupAssetBalances(Number(tokenId))
            .do()

        const ownerAddress = balances[0].address
        const { params } = await algodClient.getAssetByID(Number(tokenId)).do()
        const cid = ipfsService.algorandReserveAddressToCid(params.reserve)
        const metadata = await ipfsService.getCidContent(cid)

        return {
            ownerAddress,
            tokenId,
            metadata: {
                image: metadata.image,
                properties: metadata.properties,
            },
        }
    } catch (error) {
        console.error(error)
    }
}

export const _getPolkadotUniqueNetworkNftByTokenId = async ({
    network,
    tokenId,
    nftCollectionKey,
}: GetNftByTokenIdParams): Promise<NftData> => {
    const nftCollectionId =
    blockchainConfig().polkadotUniqueNetwork.nftCollections[nftCollectionKey][
        network
    ].collectionId

    const sdkClient = polkadotUniqueNetworkSdkClient(network)
    try {
        const nft = await sdkClient.token.get({
            collectionId: Number(nftCollectionId),
            tokenId: Number(tokenId),
        })
        const properties: Record<string, Atomic> = {}
        for (const property of nft.attributes) {
            properties[property.trait_type] = property.value
        }

        return {
            ownerAddress: nft.owner,
            tokenId,
            metadata: {
                image: nft.image,
                properties: JSON.stringify(properties),
            },
        }
    } catch (error) {
        console.error(error)
    }
}

export const _getNearNftByTokenId = async ({
    network,
    tokenId,
    nftCollectionKey,
}: GetNftByTokenIdParams): Promise<NftData> => {
    const nftCollectionId =
    blockchainConfig().near.nftCollections[nftCollectionKey][network]
        .collectionId

    const client = await nearClient(network)
    const account = await client.account("")

    const nft: NearNft = await account.viewFunction({
        contractId: nftCollectionId,
        methodName: "nft_token",
        args: { token_id: tokenId },
    })

    return {
        tokenId,
        ownerAddress: nft.owner_id,
        metadata: {
            image: nft.metadata.media,
            properties: nft.metadata.extra || "",
        },
    }
}

export const _getNftByTokenId = (
    params: GetNftByTokenIdParams,
    services: GetNftByTokenIdServices,
) => {
    const platform = chainKeyToPlatform(params.chainKey)
    switch (platform) {
    case Platform.Evm: {
        return _getEvmNftByTokenId(params, services)
    }
    case Platform.Solana: {
        return _getSolanaNftByTokenId(params, services)
    }
    case Platform.Aptos: {
        return _getAptosNftByTokenId(params, services)
    }
    case Platform.Algorand: {
        return _getAlgorandNftByTokenId(params, services)
    }
    case Platform.Polkadot: {
        return _getPolkadotUniqueNetworkNftByTokenId(params)
    }
    case Platform.Near: {
        return _getNearNftByTokenId(params)
    }
    default:
        throw new PlatformNotFoundException(platform)
    }
}
