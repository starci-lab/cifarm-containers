import { Injectable, Logger } from "@nestjs/common"
import { InjectMongoose, NFTType, PlacedItemSchema, UserSchema } from "@src/databases"
import { Connection } from "mongoose"
import {
    ValidateSolanaMetaplexNFTFrozenRequest,
    ValidateSolanaMetaplexNFTFrozenResponse
} from "./validate-solana-metaplex-nft-frozen.dto"
import { AttributeName, AttributeTypeValue, SolanaMetaplexService } from "@src/blockchain"
import { UserLike } from "@src/jwt"
import { GraphQLError } from "graphql"
import { NFTMetadataSchema } from "@src/databases"
import { StaticService } from "@src/gameplay"
import { NFTTypeToPlacedItemTypeId } from "@src/databases"
@Injectable()
export class ValidateSolanaMetaplexNFTFrozenService {
    private readonly logger = new Logger(ValidateSolanaMetaplexNFTFrozenService.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection,
        private readonly solanaMetaplexService: SolanaMetaplexService,
        private readonly staticService: StaticService
    ) {}

    async validateSolanaMetaplexNFTFrozen(
        { id }: UserLike,
        { nftAddress }: ValidateSolanaMetaplexNFTFrozenRequest
    ): Promise<ValidateSolanaMetaplexNFTFrozenResponse> {
        const mongoSession = await this.connection.startSession()
        try {
            // Using withTransaction to handle the transaction lifecycle
            const result = await mongoSession.withTransaction(async (session) => {
                // fetch the nft on-chain
                const user = await this.connection
                    .model<UserSchema>(UserSchema.name)
                    .findById(id)
                    .session(session)
                if (!user) {
                    throw new GraphQLError("User not found", {
                        extensions: {
                            code: "USER_NOT_FOUND"
                        }
                    })
                }
                const nft = await this.solanaMetaplexService.getNft({
                    nftAddress,
                    network: user.network
                })
                if (!nft) {
                    throw new GraphQLError("NFT not found", {
                        extensions: {
                            code: "NFT_NOT_FOUND"
                        }
                    })
                }
                if (!nft.permanentFreezeDelegate.frozen) {
                    throw new GraphQLError("NFT is not frozen", {
                        extensions: {
                            code: "NFT_NOT_FROZEN"
                        }
                    })
                }
                // check off-chain if the nft is not valid
                const foundNFTMetadata = await this.connection
                    .model<NFTMetadataSchema>(NFTMetadataSchema.name)
                    .findOne({
                        nftAddress,
                        user: id
                    })
                    .session(session)
                if (!foundNFTMetadata) {
                    throw new GraphQLError("NFT metadata not found", {
                        extensions: {
                            code: "NFT_METADATA_NOT_FOUND"
                        }
                    })
                }
                if (foundNFTMetadata.validated) {
                    throw new GraphQLError("NFT is already validated", {
                        extensions: {
                            code: "NFT_ALREADY_VALIDATED"
                        }
                    })
                }
                foundNFTMetadata.validated = true
                await foundNFTMetadata.save({ session })
                // thus, base on nft type, we create corresponding off-chain, first is about the fruits
                let nftType: NFTType
                for (const _nftType of Object.values(NFTType)) {
                    const found = this.staticService.nftCollections[_nftType][user.network].collectionAddress ===
                            foundNFTMetadata.collectionAddress
                    if (found) {
                        nftType = _nftType
                        break
                    }
                }
                if (!nftType) {
                    throw new GraphQLError("NFT type not found", {
                        extensions: {
                            code: "NFT_TYPE_NOT_FOUND"
                        }
                    })
                }
                
                switch (
                    nft.attributes.attributeList.find(
                        (attribute) => attribute.key === AttributeName.Type
                    )?.value
                ) {
                case AttributeTypeValue.Fruit: {
                    const placedItemTypeId = NFTTypeToPlacedItemTypeId[nftType]
                    const placedItemType = this.staticService.placedItemTypes.find(
                        (placedItemType) => placedItemType.displayId === placedItemTypeId
                    )
                    if (!placedItemType) {
                        throw new GraphQLError("Placed item type not found", {
                            extensions: {
                                code: "PLACED_ITEM_TYPE_NOT_FOUND"
                            }
                        })
                    }   
                    await this.connection
                        .model<PlacedItemSchema>(PlacedItemSchema.name)
                        .create([
                            {
                                user: id,
                                // since x,y is required, we set both to 0
                                x: 0,
                                y: 0,
                                placedItemType: placedItemType.id,
                                fruitInfo: {
                                    [AttributeName.QualityYieldChance]: nft.attributes.attributeList.find(
                                        (attribute) => attribute.key === AttributeName.QualityYieldChance
                                    )?.value,
                                    [AttributeName.GrowthAcceleration]: nft.attributes.attributeList.find(
                                        (attribute) => attribute.key === AttributeName.GrowthAcceleration
                                    )?.value,
                                    [AttributeName.HarvestYieldBonus]: nft.attributes.attributeList.find(
                                        (attribute) => attribute.key === AttributeName.HarvestYieldBonus
                                    )?.value,
                                    [AttributeName.DiseaseResistance]: nft.attributes.attributeList.find(
                                        (attribute) => attribute.key === AttributeName.DiseaseResistance
                                    )?.value
                                },
                                isStored: true
                            }
                        ],
                        { session }
                        )
                    break
                }
                default:
                    throw new GraphQLError("NFT type not supported", {
                        extensions: {
                            code: "NFT_TYPE_NOT_SUPPORTED"
                        }
                    })
                }
                return {
                    message: "NFT validated successfully",
                    success: true
                }
            })
            return result
        } catch (error) {
            this.logger.error(error)
            throw error
        } finally {
            await mongoSession.endSession()
        }
    }
}
