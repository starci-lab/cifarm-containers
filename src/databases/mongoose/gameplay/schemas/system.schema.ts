import { Field, Float, ID, Int, ObjectType } from "@nestjs/graphql"
import JSON from "graphql-type-json"
import {
    CropId,
    DailyRewardId,
    GraphQLTypeCropId,
    SystemId,
    GraphQLTypeSystemId,
    NFTType,
    NFTRarity,
    GraphQLTypeNFTType,
    TokenType,
    GraphQLTypeTokenType,
    TokenKey,
    GraphQLTypeTokenKey
} from "../enums"
import { AbstractSchema } from "./abstract"
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { Position } from "./types"
import { Network, ChainKey } from "@src/env"
import { AttributeName } from "@src/blockchain"
import { Types } from "mongoose"

@ObjectType({
    description: "The system schema"
})
@Schema({
    timestamps: true,
    collection: "systems"
})
export class SystemSchema extends AbstractSchema {
    @Field(() => GraphQLTypeSystemId, {
        description: "The display ID of the system"
    })
    @Prop({ type: String, enum: SystemId, required: true, unique: true })
        displayId: SystemId

    @Field(() => JSON, {
        description: "The system configuration value"
    })
    @Prop({ type: Object, required: true })
        value: object
}

@ObjectType({
    description: "Information about an activity's rewards and costs"
})
export class ActivityInfo {
    @Field(() => Int, {
        nullable: true,
        description: "The amount of experience gained from the activity"
    })
        experiencesGain?: number
    @Field(() => Int, {
        description: "The amount of energy consumed by the activity"
    })
        energyConsume: number
}

@ObjectType({
    description: "Configuration for all gameplay activities"
})
export class Activities {
    @Field(() => ActivityInfo, {
        description: "Configuration for planting seeds"
    })
        plantSeed: ActivityInfo

    @Field(() => ActivityInfo, {
        description: "Configuration for watering crops"
    })
        useWateringCan: ActivityInfo

    @Field(() => ActivityInfo, {
        description: "Configuration for feeding animals"
    })
        useAnimalFeed: ActivityInfo

    @Field(() => ActivityInfo, {
        description: "Configuration for harvesting animal products"
    })
        harvestAnimal: ActivityInfo

    @Field(() => ActivityInfo, {
        description: "Configuration for using pesticide"
    })
        usePesticide: ActivityInfo

    @Field(() => ActivityInfo, {
        description: "Configuration for using fertilizer"
    })
        useFertilizer: ActivityInfo

    @Field(() => ActivityInfo, {
        description: "Configuration for using herbicide"
    })
        useHerbicide: ActivityInfo

    @Field(() => ActivityInfo, {
        description: "Configuration for helping others use herbicide"
    })
        helpUseHerbicide: ActivityInfo

    @Field(() => ActivityInfo, {
        description: "Configuration for helping others use pesticide"
    })
        helpUsePesticide: ActivityInfo

    @Field(() => ActivityInfo, {
        description: "Configuration for helping others water crops"
    })
        helpUseWateringCan: ActivityInfo

    @Field(() => ActivityInfo, {
        description: "Configuration for stealing crops"
    })
        thiefPlant: ActivityInfo

    @Field(() => ActivityInfo, {
        description: "Configuration for thief animal"
    })
        thiefAnimal: ActivityInfo

    @Field(() => ActivityInfo, {
        description: "Configuration for using animal medicine"
    })
        useAnimalMedicine: ActivityInfo

    @Field(() => ActivityInfo, {
        description: "Configuration for helping others use animal medicine"
    })
        helpUseAnimalMedicine: ActivityInfo

    @Field(() => ActivityInfo, {
        description: "Configuration for harvesting crops"
    })
        harvestPlant: ActivityInfo

    @Field(() => ActivityInfo, {
        description: "Configuration for helping others feed animals"
    })
        helpUseAnimalFeed: ActivityInfo

    @Field(() => ActivityInfo, {
        description: "Configuration for using fruit fertilizer"
    })
        useFruitFertilizer: ActivityInfo

    @Field(() => ActivityInfo, {
        description: "Configuration for using bug net"
    })
        useBugNet: ActivityInfo

    @Field(() => ActivityInfo, {
        description: "Configuration for helping others use fruit fertilizer"
    })
        helpUseFruitFertilizer: ActivityInfo

    @Field(() => ActivityInfo, {
        description: "Configuration for helping others use bug net"
    })
        helpUseBugNet: ActivityInfo

    @Field(() => ActivityInfo, {
        description: "Configuration for harvesting fruits"
    })
        harvestFruit: ActivityInfo

    @Field(() => ActivityInfo, {
        description: "Configuration for stealing fruits"
    })
        thiefFruit: ActivityInfo
    @Field(() => ActivityInfo, {
        description: "Configuration for harvesting bee house"
    })
        harvestBeeHouse: ActivityInfo
    @Field(() => ActivityInfo, {
        description: "Configuration for thief bee house"
    })
        thiefBeeHouse: ActivityInfo
}

@ObjectType({
    description: "Configuration for crop randomness events"
})
export class CropRandomness {
    @Field(() => Float, {
        description: "Chance for a crop to be stolen by 3 thieves"
    })
        thief3: number

    @Field(() => Float, {
        description: "Chance for a crop to be stolen by 2 thieves"
    })
        thief2: number

    @Field(() => Float, {
        description: "Chance for a crop to need water"
    })
        needWater: number

    @Field(() => Float, {
        description: "Chance for a crop to become weedy or infested"
    })
        isWeedyOrInfested: number
}

@ObjectType({
    description: "Configuration for crop info"
})
export class CropInfo {
    @Field(() => CropRandomness, {
        description: "Configuration for crop randomness events"
    })
        randomness: CropRandomness

    @Field(() => Int, {
        description: "The number of times the crop can be harvested",
        defaultValue: 3
    })
        nextGrowthStageAfterHarvest: number

    @Field(() => Int, {
        description: "The number of growth stages for the crop",
        defaultValue: 5
    })
        growthStages: number

    @Field(() => Int, {
        description: "Minimum percentage of the total quantity that can be stolen by a thief",
        defaultValue: 5
    })
        minThievablePercentage: number
}

@ObjectType({
    description: "Configuration for bee house randomness events"
})
export class BeeHouseRandomness {
    @Field(() => Float, {
        description: "Chance for a bee house to be stolen by 3 thieves"
    })
        thief3: number

    @Field(() => Float, {
        description: "Chance for a bee house to be stolen by 2 thieves"
    })
        thief2: number
}

@ObjectType({
    description: "Configuration for bee house theft mechanics"
})
export class BeeHouseInfo {
    @Field(() => BeeHouseRandomness, {
        description: "Configuration for bee house randomness events"
    })
        randomness: BeeHouseRandomness
    @Field(() => Int, {
        description: "Minimum percentage of the total quantity that can be stolen by a thief",
        defaultValue: 5
    })
        minThievablePercentage: number
}

@ObjectType({
    description: "Configuration for flower randomness events"
})
export class FlowerRandomness {
    @Field(() => Float, {
        description: "Chance for a flower to be stolen by 3 thieves"
    })
        thief3: number

    @Field(() => Float, {
        description: "Chance for a crop to be stolen by 2 thieves"
    })
        thief2: number

    @Field(() => Float, {
        description: "Chance for a crop to need water"
    })
        needWater: number

    @Field(() => Float, {
        description: "Chance for a crop to become weedy or infested"
    })
        isWeedyOrInfested: number
}

@ObjectType({
    description: "Configuration for flower info"
})
export class FlowerInfo {
    @Field(() => FlowerRandomness, {
        description: "Configuration for flower randomness events"
    })
        randomness: FlowerRandomness

    @Field(() => Int, {
        description: "The number of times the flower can be harvested",
        defaultValue: 3
    })
        nextGrowthStageAfterHarvest: number

    @Field(() => Int, {
        description: "The number of growth stages for the flower",
        defaultValue: 5
    })
        growthStages: number

    @Field(() => Int, {
        description: "Minimum percentage of the total quantity that can be stolen by a thief",
        defaultValue: 5
    })
        minThievablePercentage: number
}

@ObjectType({
    description: "Configuration for animal randomness events"
})
export class AnimalRandomness {
    @Field(() => Float, {
        description: "Chance for an animal to become sick"
    })
        sickChance: number

    @Field(() => Float, {
        description: "Chance for an animal product to be stolen by 3 thieves"
    })
        thief3: number

    @Field(() => Float, {
        description: "Chance for an animal product to be stolen by 2 thieves"
    })
        thief2: number
}

@ObjectType({
    description: "Configuration for animal info"
})
export class AnimalInfo {
    @Field(() => AnimalRandomness, {
        description: "Configuration for animal randomness events"
    })
        randomness: AnimalRandomness

    @Field(() => Int, {
        description: "Minimum percentage of the total quantity that can be stolen by a thief",
        defaultValue: 5
    })
        minThievablePercentage: number
}

@ObjectType({
    description: "Configuration for fruit randomness events"
})
export class FruitRandomness {
    @Field(() => Float, {
        description: "Chance for a fruit to be stolen by 3 thieves"
    })
        thief3: number

    @Field(() => Float, {
        description: "Chance for a fruit to be stolen by 2 thieves"
    })
        thief2: number

    @Field(() => Float, {
        description: "Chance for a fruit to have caterpillars"
    })
        isBuggy: number
}

@ObjectType({
    description: "Configuration for fruit info"
})
export class FruitInfo {
    @Field(() => FruitRandomness, {
        description: "Configuration for fruit randomness events"
    })
        randomness: FruitRandomness

    @Field(() => Int, {
        description: "The number of times the fruit can be harvested",
        defaultValue: 3
    })
        nextGrowthStageAfterHarvest: number

    @Field(() => Int, {
        description: "The number of growth stages for the fruit",
        defaultValue: 5
    })
        growthStages: number

    @Field(() => Int, {
        description: "The growth stage of the fruit when it is mature",
        defaultValue: 3
    })
        matureGrowthStage: number

    @Field(() => Int, {
        description: "Minimum percentage of the total quantity that can be stolen by a thief",
        defaultValue: 5
    })
        minThievablePercentage: number
}

@ObjectType({
    description: "Default positions for farm elements"
})
export class Positions {
    @Field(() => [Position], {
        description: "Default positions for tiles"
    })
        tiles: Array<Position>

    @Field(() => Position, {
        description: "Default position for the home building"
    })
        home: Position

    @Field(() => Position, {
        description: "Default position for the bee house"
    })
        beeHouse: Position

    @Field(() => [Position], {
        description: "Default positions for the banana fruits"
    })
        bananaFruits: Array<Position>

    @Field(() => Position, {
        description: "Default position for the coop"
    })
        coop: Position

    @Field(() => [Position], {
        description: "Default positions for the chickens"
    })
        chickens: Array<Position>

    @Field(() => [Position], {
        description: "Default positions for the small stones"
    })
        smallStones: Array<Position>

    @Field(() => [Position], {
        description: "Default positions for the small grass patches"
    })
        smallGrassPatches: Array<Position>

    @Field(() => [Position], {
        description: "Default positions for the oak trees"
    })
        oakTrees: Array<Position>

    @Field(() => [Position], {
        description: "Default positions for the pine trees"
    })
        pineTrees: Array<Position>

    @Field(() => [Position], {
        description: "Default positions for the maple trees"
    })
        mapleTrees: Array<Position>
}

@ObjectType({
    description: "Default configuration for new users"
})
export class LandLimit {
    @Field(() => Int, {
        description: "Current land limit index",
        nullable: true
    })
        index: number

    @Field(() => Float, {
        description: "Default land limit price",
        nullable: true
    })
        price?: number

    @Field(() => GraphQLTypeTokenKey, {
        description: "Default token key",
        nullable: true
    })
        tokenKey?: TokenKey

    @Field(() => Boolean, {
        description: "Default option for land limit",
        nullable: true
    })
        default?: boolean
    
    @Field(() => Int, {
        description: "Default land limit"
    })
        tileLimit: number

    @Field(() => Int, {
        description: "Default fruit limit"
    })
        fruitLimit: number

    @Field(() => Int, {
        description: "Default building limit"
    })
        buildingLimit: number

    @Field(() => Int, {
        description: "Default same building limit"
    })
        sameBuildingLimit: number
}

@ObjectType({
    description: "Default configuration for new users"
})
export class LandLimitInfo {
    @Field(() => [LandLimit], {
        description: "Default land limits"
    })
        landLimits: Array<LandLimit>      
}

@ObjectType({
    description: "Default configuration for new users"
})
export class DefaultInfo {
    @Field(() => Int, {
        description: "Default starting gold amount"
    })
        golds: number

    @Field(() => Positions, {
        description: "Default positions for farm elements"
    })
        positions: Positions

    @Field(() => GraphQLTypeCropId, {
        description: "Default crop ID given to new users"
    })
        defaultCropId: CropId

    @Field(() => Int, {
        description: "Default seed quantity given to new users"
    })
        defaultSeedQuantity: number

    @Field(() => Int, {
        description: "Default storage capacity"
    })
        storageCapacity: number

    @Field(() => Int, {
        description: "Default tool capacity"
    })
        toolCapacity: number

    @Field(() => Int, {
        description: "Default delivery capacity"
    })
        deliveryCapacity: number
        
    @Field(() => Int, {
        description: "Default wholesale market capacity"
    })
        wholesaleMarketCapacity: number

    @Field(() => Int, {
        description: "Maximum number of users that can be followed"
    })
        followeeLimit: number

    @Field(() => Int, {
        description: "Maximum number of users that can be referred"
    })
        referredLimit: number

    @Field(() => Int, {
        description: "Reward quantity for referring a user"
    })
        referralRewardQuantity: number

    @Field(() => Int, {
        description: "Reward quantity for being referred by a user"
    })
        referredRewardQuantity: number

    @Field(() => Int, {
        description: "Reward quantity for following on X/Twitter"
    })
        followXRewardQuantity: number
}

@ObjectType({
    description: "Configuration for spin wheel slots"
})
export class SlotInfo {
    @Field(() => Int, {
        description: "Number of slots of this type"
    })
        count: number

    @Field(() => Float, {
        description: "Minimum threshold for this slot type"
    })
        thresholdMin: number

    @Field(() => Float, {
        description: "Maximum threshold for this slot type"
    })
        thresholdMax: number
}

@ObjectType({
    description: "Configuration for character model addresses"
})
export class CharacterModelAddresses {
    @Field(() => String, {
        description: "Testnet address"
    })
        testnet: string

    @Field(() => String, {
        description: "Mainnet address"
    })
        mainnet: string
}

@ObjectType({
    description: "Configuration for character models"
})
export class CharacterModels {
    @Field(() => CharacterModelAddresses, {
        description: "Character model addresses"
    })
    [NFTType.DragonFruit]: CharacterModelAddresses
}

@ObjectType({
    description: "Configuration for honeycomb rewards"
})
export class HoneycombInfo {
    @Field(() => Int, {
        description: "Daily reward amount for honeycomb"
    })
        dailyRewardAmount: number

    @Field(() => String, {
        description: "Project address for honeycomb"
    })
        projectAddress: string

    @Field(() => String, {
        description: "Token resource address for honeycomb"
    })
        tokenResourceAddress: string

    @Field(() => Int, {
        description: "Number of decimals for honeycomb tokens"
    })
        decimals: number

    @Field(() => [String], {
        description: "Profile tree addresses for honeycomb"
    })
        profilesTreeAddresses: Array<string>

    @Field(() => CharacterModels, {
        description: "Character models"
    })
        characterModels: CharacterModels
}

@ObjectType({
    description: "Configuration for energy regeneration"
})
export class EnergyRegen {
    @Field(() => Int, {
        description: "Time in milliseconds for energy regeneration"
    })
        time: number
}

@ObjectType({
    description: "Configuration for daily rewards"
})
export class DailyReward {
    @Field(() => Int, {
        nullable: true,
        description: "Gold amount for this daily reward"
    })
        golds: number

    @Field(() => Int, {
        description: "Day number for this daily reward"
    })
        day: number

    @Field(() => Boolean, {
        description: "Whether this is the last day in the daily reward cycle"
    })
        lastDay: boolean
}

@ObjectType({
    description: "Configuration for daily reward system"
})
export class DailyRewardInfo {
    @Field(() => DailyReward, {
        description: "Day 1 reward"
    })
    [DailyRewardId.Day1]: DailyReward

    @Field(() => DailyReward, {
        description: "Day 2 reward"
    })
    [DailyRewardId.Day2]: DailyReward

    @Field(() => DailyReward, {
        description: "Day 3 reward"
    })
    [DailyRewardId.Day3]: DailyReward

    @Field(() => DailyReward, {
        description: "Day 4 reward"
    })
    [DailyRewardId.Day4]: DailyReward

    @Field(() => DailyReward, {
        description: "Day 5 reward"
    })
    [DailyRewardId.Day5]: DailyReward
}

@ObjectType({
    description: "Configuration for NFT rarity"
})
export class NFTRarityInfo {
    @Field(() => Float, {
        description: "Growth acceleration"
    })
    [AttributeName.GrowthAcceleration]: number

    @Field(() => Float, {
        description: "Quality yield"
    })
    [AttributeName.QualityYield]: number

    @Field(() => Float, {
        description: "Disease resistance"
    })
    [AttributeName.DiseaseResistance]: number

    @Field(() => Float, {
        description: "Harvest yield bonus"
    })
    [AttributeName.HarvestYieldBonus]: number
}

@ObjectType({
    description: "Configuration for NFT fruit stage"
})
export class NFTFruitStage {
    @Field(() => Int, {
        description: "Fruit stage"
    })
        stage: number
    @Field(() => String, {
        description: "Image URL for fruit stage"
    })
        imageUrl: string
}

@ObjectType({
    description: "Configuration for NFT fruit stages"
})
export class NFTFruitStages {
    @Field(() => [NFTFruitStage], {
        description: "Fruit stages"
    })
        stages: Array<NFTFruitStage>
}

@ObjectType({
    description: "Configuration for NFT rarities"
})
export class NFTRarities {
    @Field(() => NFTRarityInfo, {
        description: "Common rarity"
    })
    [NFTRarity.Common]: NFTRarityInfo

    @Field(() => NFTRarityInfo, {
        description: "Rare rarity"
    })
    [NFTRarity.Rare]: NFTRarityInfo

    @Field(() => NFTRarityInfo, {
        description: "Epic rarity"
    })
    [NFTRarity.Epic]: NFTRarityInfo
}

@ObjectType({
    description: "Configuration for NFT collection data"
})
export class NFTCollectionData {
    @Field(() => String, {
        description: "Sui treasury cap address",
        nullable: true
    })
    @Prop({ type: String, required: false })
        suiNFTTreasuryCapId?: string
    @Field(() => ID, {
        description: "Placed item type id"
    })
        placedItemTypeId: Types.ObjectId

    @Field(() => String, {
        description: "Collection name"
    })
        name: string
    @Field(() => String, {
        description: "Collection address"
    })
        collectionAddress: string

    @Field(() => String, {
        description: "Collection image URL"
    })
        imageUrl: string

    @Field(() => NFTRarities, {
        description: "NFT rarities"
    })
        rarities: NFTRarities

    @Field(() => NFTFruitStages, {
        description: "NFT fruit stages",
        nullable: true
    })
        fruitStages?: NFTFruitStages
}

@ObjectType({
    description: "Configuration for NFT collections"
})
export class NFTCollection {
    @Field(() => NFTCollectionData, {
        description: "Testnet collection address"
    })
    [Network.Testnet]: NFTCollectionData

    @Field(() => NFTCollectionData, {
        description: "Mainnet collection address"
    })
    [Network.Mainnet]: NFTCollectionData
}

@ObjectType({
    description: "Configuration for NFT collections"
})
export class NFTCollections {
    @Field(() => NFTCollection, {
        description: "NFT collection"
    })
    [NFTType.DragonFruit]: NFTCollection

    @Field(() => NFTCollection, {
        description: "NFT collection"
    })
    [NFTType.Pomegranate]: NFTCollection
    @Field(() => NFTCollection, {
        description: "NFT collection"
    })
    [NFTType.Rambutan]: NFTCollection

    @Field(() => NFTCollection, {
        description: "NFT collection"
    })
    [NFTType.Jackfruit]: NFTCollection
}

@ObjectType({
    description: "Each chance for a NFT box"
})
export class NFTBoxChance {
    @Field(() => GraphQLTypeNFTType, {
        description: "NFT type"
    })
        nftType: NFTType
    @Field(() => Float, {
        description: "Start chance"
    })
        startChance: number
    @Field(() => Float, {
        description: "End chance"
    })
        endChance: number
    @Field(() => Float, {
        description: "Rare rarity chance"
    })
        rareRarityChance: number
    @Field(() => Float, {
        description: "Epic rarity chance"
    })
        epicRarityChance: number
}

@ObjectType({
    description: "Configuration for NFT starter box"
})
export class NFTBoxInfo {
    @Field(() => [NFTBoxChance], {
        description: "Each chance for a box configuration"
    })
        chances: Array<NFTBoxChance>

    @Field(() => Float, {
        description: "Price for each box"
    })
        boxPrice: number

    @Field(() => GraphQLTypeTokenKey, {
        description: "Payment kind"
    })
        tokenKey: TokenKey
    
    @Field(() => Float, {
        description: "Fee percentage"
    })
        feePercentage: number
}

@ObjectType({
    description: "Revenue recipient"
})
export class RevenueRecipient {
    @Field(() => String, {
        description: "Revenue recipient address"
    })
        address: string
}

@ObjectType({
    description: "Revenue recipients"
})
export class RevenueRecipients {
    @Field(() => RevenueRecipient, {
        description: "Revenue recipient"
    })
    [Network.Testnet]: RevenueRecipient

    @Field(() => RevenueRecipient, {
        description: "Revenue recipient"
    })
    [Network.Mainnet]: RevenueRecipient
}

@ObjectType({
    description: "Gold purchase option"
})
export class GoldPurchaseOption {   
    @Field(() => Float, {
        description: "Price"
    })
        price: number

    @Field(() => Float, {
        description: "Amount"
    })
        amount: number
    @Field(() => GraphQLTypeTokenKey, {
        description: "Payment kind"
    })
        tokenKey: TokenKey
}

@ObjectType({
    description: "Gold purchase"
})
export class GoldPurchase {
    @Field(() => [GoldPurchaseOption], {
        description: "Gold purchase options"
    })
        options: Array<GoldPurchaseOption>
}

@ObjectType({
    description: "Gold purchases"
})
export class GoldPurchases {
    @Field(() => GoldPurchase, {
        description: "Gold purchase"
    })
    [Network.Testnet]: GoldPurchase

    @Field(() => GoldPurchase, {
        description: "Gold purchase"
    })
    [Network.Mainnet]: GoldPurchase
}

@ObjectType({
    description: "Interaction permissions"
})
export class InteractionPermissions  {
    @Field(() => Int, {
        description: "Maximum level difference"
    })
        thiefLevelGapThreshold: number
}

@ObjectType({
    description: "Configuration for the cat"
})
export class CatInfo {
    @Field(() => Float, {
        description: "Chance"
    })
        chance: number
    @Field(() => Float, {
        description: "Percent quantity bonus"
    })
        percentQuantityBonus: number
    @Field(() => Float, {
        description: "Plus quantity"
    })
        plusQuantity: number
}

@ObjectType({
    description: "Configuration for the dog"
})
export class DogInfo {
    @Field(() => Float, {
        description: "Chance"
    })
        chance: number
    @Field(() => Float, {
        description: "Energy reduce"
    })
        energyReduce: number
}

@ObjectType({
    description: "Configuration for the pet"
})
export class PetInfo {
    @Field(() => CatInfo, {
        description: "Cat info"
    })
        cat: CatInfo
    @Field(() => DogInfo, {
        description: "Dog info"
    })
        dog: DogInfo
}

@ObjectType({
    description: "Configuration for token data"
})
export class TokenData {
    @Field(() => String, {
        description: "Token name"
    })
        name: string
    
    @Field(() => GraphQLTypeTokenType, {
        description: "Token type"
    })
        tokenType: TokenType

    // token address will be "native" for native tokens
    @Field(() => String, {
        description: "Token address",
        nullable: true
    })
        tokenAddress?: string

    @Field(() => String, {
        description: "Token symbol"
    })
        symbol: string

    @Field(() => Int, {
        description: "Token decimals"
    })
        decimals: number

    @Field(() => String, {
        description: "Token image URL",
        nullable: true
    })
        imageUrl?: string
}

@ObjectType({
    description: "Configuration for token"
})
export class TokenWrapped {
    @Field(() => TokenData, {
        description: "Testnet token data",
        nullable: true
    })
    [Network.Testnet]?: TokenData

    @Field(() => TokenData, {
        description: "Mainnet token data",
        nullable: true
    })
    [Network.Mainnet]?: TokenData
}

@ObjectType({
    description: "Token"
})
export class Token {
    @Field(() => TokenWrapped, {
        description: "Token wrapped",
        nullable: true
    })
    [ChainKey.Solana]?: TokenWrapped

    @Field(() => TokenWrapped, {
        description: "Token wrapped",
        nullable: true
    })
    [ChainKey.Sui]?: TokenWrapped
}
@ObjectType({
    description: "Configuration for tokens"
})
export class Tokens {
    @Field(() => Token, {
        description: "Token",
        nullable: true
    })
    [TokenKey.Native]?: Token

    @Field(() => Token, {
        description: "Token",
        nullable: true
    })
    [TokenKey.USDC]?: Token

    @Field(() => Token, {
        description: "Token",
        nullable: true
    })
    [TokenKey.USDT]?: Token

    @Field(() => Token, {
        description: "Token",
        nullable: true
    })
    [TokenKey.CIFARM]?: Token
}

@ObjectType({
    description: "Configuration for referral"
})
export class Referral {
    @Field(() => Float, {
        description: "Amount per successful referral"
    })
        amountPerSuccessfulReferral: number
    @Field(() => Float, {
        description: "Amount when joining with a referral"
    })
        amountWhenJoiningWithReferral: number
    @Field(() => Float, {
        description: "Amount when your referral invites someone"
    })
        amountWhenYourReferralInviteSomeone: number
}

@ObjectType({
    description: "Configuration for NFT conversion"
})
export class NFTConversion {
    @Field(() => Int, {
        description: "Conversion rate"
    })
        conversionRate: number
}

@ObjectType({
    description: "Energy purchase option"
})
export class EnergyPurchaseOption {   
    @Field(() => Float, {
        description: "Price"
    })
        price: number

    @Field(() => Float, {
        description: "Percentage"
    })
        percentage: number
    @Field(() => GraphQLTypeTokenKey, {
        description: "Token key"
    })
        tokenKey: TokenKey
}

@ObjectType({
    description: "Energy purchase options"
})
export class EnergyPurchase {   
    @Field(() => [EnergyPurchaseOption], {
        description: "Energy purchase options"
    })
        options: Array<EnergyPurchaseOption>
}

@ObjectType({
    description: "Energy purchases"
})
export class EnergyPurchases {
    @Field(() => EnergyPurchase, {
        description: "Energy purchase"
    })
    [Network.Testnet]: EnergyPurchase

    @Field(() => EnergyPurchase, {
        description: "Energy purchase"
    })
    [Network.Mainnet]: EnergyPurchase
}


// Generate the Mongoose schema class
export const SystemSchemaClass = SchemaFactory.createForClass(SystemSchema)
