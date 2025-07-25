import { Field, ID, Int, ObjectType } from "@nestjs/graphql"
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { Schema as MongooseSchema, Types } from "mongoose"
import { AbstractSchema } from "./abstract"
import { AnimalInfoSchema, AnimalInfoSchemaClass } from "./animal-info.schema"
import { BuildingInfoSchema, BuildingInfoSchemaClass } from "./building-info.schema"
import { PlantInfoSchema, PlantInfoSchemaClass } from "./plant-info.schema"
import { TileInfoSchema, TileInfoSchemaClass } from "./tile-info.schema"
import { UserSchema } from "./user.schema"
import { PlacedItemTypeSchema } from "./placed-item-type.schema"
import {
    ANIMAL_INFO,
    BEE_HOUSE_INFO,
    BUILDING_INFO,
    FRUIT_INFO,
    PLACED_ITEM_TYPE,
    TILE_INFO,
    PLANT_INFO,
    PET_INFO,
    NFT_METADATA,
    TERRAIN_INFO,
    USER,
    DECORATION_INFO
} from "../constants"
import { FruitInfoSchema, FruitInfoSchemaClass } from "./fruit-info.schema"
import { BeeHouseInfoSchema, BeeHouseInfoSchemaClass } from "./bee-house-info.schema"
import { PetInfoSchema, PetInfoSchemaClass } from "./pet-info.schema"
import { NFTMetadataSchema } from "./nft-metadata.schema"
import { TerrainInfoSchema, TerrainInfoSchemaClass } from "./terrain-info.schema"
import { DecorationInfoSchema, DecorationInfoSchemaClass } from "./decoration-info.schema"

@ObjectType({
    description: "The schema for items placed on the farm"
})
@Schema({ timestamps: true, collection: "placed-items" })
export class PlacedItemSchema extends AbstractSchema {
    @Field(() => Int, {
        description: "The x-coordinate position of the placed item"
    })
    @Prop({ type: Number, required: true })
        x: number

    @Field(() => Int, {
        description: "The y-coordinate position of the placed item"
    })
    @Prop({ type: Number, required: true })
        y: number
    
    @Field(() => ID, {
        description: "The user who owns this placed item"
    })
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: UserSchema.name, index: true })
    [USER]: UserSchema | Types.ObjectId

    @Field(() => ID, {
        description: "The type of the placed item"
    })
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: PlacedItemTypeSchema.name })
    [PLACED_ITEM_TYPE]: PlacedItemTypeSchema | Types.ObjectId

    @Field(() => AnimalInfoSchema, { 
        nullable: true,
        description: "The animal info associated with this placed item, if applicable"
    })
    @Prop({ type: AnimalInfoSchemaClass, required: false })
    [ANIMAL_INFO]?: AnimalInfoSchema

    @Field(() => BuildingInfoSchema, { 
        nullable: true,
        description: "The building info associated with this placed item, if applicable"
    })
    @Prop({ type: BuildingInfoSchemaClass, required: false })
    [BUILDING_INFO]?: BuildingInfoSchema

    @Field(() => PlantInfoSchema, { 
        nullable: true,
        description: "The crop info associated with this placed item, if applicable"
    })
    @Prop({ type: PlantInfoSchemaClass, required: false })
    [PLANT_INFO]?: PlantInfoSchema

    @Field(() => TileInfoSchema, { 
        nullable: true,
        description: "The tile info associated with this placed item, if applicable"
    })
    @Prop({ type: TileInfoSchemaClass, required: false })
    [TILE_INFO]?: TileInfoSchema

    @Field(() => FruitInfoSchema, { 
        nullable: true,
        description: "The fruit info associated with this placed item, if applicable"
    })
    @Prop({ type: FruitInfoSchemaClass, required: false })
    [FRUIT_INFO]?: FruitInfoSchema

    @Field(() => TerrainInfoSchema, { 
        nullable: true,
        description: "The terrain info associated with this placed item, if applicable"
    })
    @Prop({ type: TerrainInfoSchemaClass, required: false })
    [TERRAIN_INFO]?: TerrainInfoSchema

    @Field(() => BeeHouseInfoSchema, { 
        nullable: true,
        description: "The bee house info associated with this placed item, if applicable"
    })
    @Prop({ type: BeeHouseInfoSchemaClass, required: false })
    [BEE_HOUSE_INFO]?: BeeHouseInfoSchema

    @Field(() => PetInfoSchema, { 
        nullable: true,
        description: "The pet info associated with this placed item, if applicable"
    })
    @Prop({ type: PetInfoSchemaClass, required: false })
    [PET_INFO]?: PetInfoSchema

    @Field(() => DecorationInfoSchema, { 
        nullable: true,
        description: "The decoration info associated with this placed item, if applicable"
    })
    @Prop({ type: DecorationInfoSchemaClass, required: false })
    [DECORATION_INFO]?: DecorationInfoSchema

    @Field(() => Boolean, {
        defaultValue: false,
        description: "Whether the placed item is stored in the NFT storage"
    })
    @Prop({ type: Boolean,  default: false })
        isStored: boolean

    @Field(() => NFTMetadataSchema, {
        nullable: true,
        description: "The NFT metadata associated with this placed item, if applicable"
    })
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: NFTMetadataSchema.name, required: false })
    [NFT_METADATA]?: NFTMetadataSchema | Types.ObjectId
}

// Generate Mongoose Schema
export const PlacedItemSchemaClass = SchemaFactory.createForClass(PlacedItemSchema)

PlacedItemSchemaClass.index({
    [PLACED_ITEM_TYPE]: 1,
    "plantInfo.currentState": 1,
    createdAt: -1,  // vì bạn sort DESC
})

PlacedItemSchemaClass.index({
    placedItemType: 1,
    "fruitInfo.currentState": 1,
    isStored: 1,
    createdAt: -1,
})

PlacedItemSchemaClass.index({
    placedItemType: 1,
    "animalInfo.currentState": 1,
    createdAt: 1,
})

PlacedItemSchemaClass.index({
    placedItemType: 1,
    "beeHouseInfo.currentState": 1,
    createdAt: -1,
})