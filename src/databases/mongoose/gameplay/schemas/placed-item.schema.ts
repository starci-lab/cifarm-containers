import { Field, Float, ID, Int, ObjectType } from "@nestjs/graphql"
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { HydratedDocument } from "mongoose"
import { AbstractSchema } from "./abstract"
import { AnimalCurrentState, CropCurrentState, PlacedItemTypeKey } from "../enums"
import { SeedGrowthInfoSchema, SeedGrowthInfoSchemaClass } from "./seed-growth-info"

// Mongoose document type
export type TileInfoDocument = HydratedDocument<TileInfo>;

@ObjectType()
@Schema({ timestamps: true })
export class TileInfo extends AbstractSchema {
    
    @Field(() => Int)
    @Prop({ type: Number, default: 0 })
        harvestCount: number

    @Field(() => ID)
    @Prop({ type: String, required: true })
        placedItemId: string
}

export const TileInfoSchemaClass = SchemaFactory.createForClass(TileInfo)

export type BuildingInfoDocument = HydratedDocument<BuildingInfo>;

@ObjectType()
@Schema({ timestamps: true })
export class BuildingInfo  extends AbstractSchema {
    @Field(() => Int)
    @Prop({ type: Number, default: 0 })
        currentUpgrade: number

    @Field(() => String)
    @Prop({ type: String, required: true })
        placedItemId: string
}

export const BuildingInfoSchemaClass = SchemaFactory.createForClass(BuildingInfo)

export type AnimalInfoDocument = HydratedDocument<AnimalInfo>;

@ObjectType()
@Schema({ timestamps: true })
export class AnimalInfo  extends AbstractSchema {
    @Field(() => Float)
    @Prop({ type: Number, default: 0 })
        currentGrowthTime: number

    @Field(() => Float)
    @Prop({ type: Number, default: 0 })
        currentHungryTime: number

    @Field(() => Float)
    @Prop({ type: Number, default: 0 })
        currentYieldTime: number

    @Field(() => Boolean)
    @Prop({ type: Boolean, default: false })
        isAdult: boolean

    @Field(() => Boolean)
    @Prop({ type: Boolean, default: false })
        isQuality: boolean

    @Field(() => Int)
    @Prop({ type: Number, default: 0 })
        yieldCount: number

    @Field(() => String)
    @Prop({ type: String, enum: AnimalCurrentState, default: AnimalCurrentState.Normal })
        currentState: AnimalCurrentState

    @Field(() => Int, { nullable: true })
    @Prop({ type: Number, required: false })
        harvestQuantityRemaining?: number

    @Field(() => Boolean)
    @Prop({ type: Boolean, default: false })
        immunized: boolean
}

export const AnimalInfoSchemaClass = SchemaFactory.createForClass(AnimalInfo)

export type PlacedItemDocument = HydratedDocument<PlacedItemSchema>;

@ObjectType()
@Schema({ timestamps: true, collection: "placed-items" })
export class PlacedItemSchema extends AbstractSchema {
    @Field(() => Int)
    @Prop({ type: Number, required: true })
        x: number
    
    @Field(() => Int)
    @Prop({ type: Number, required: true })
        y: number

    @Field(() => String, { nullable: true })
    @Prop({ type: String, required: false })
        inventoryId?: string

    @Field(() => String)
    @Prop({ type: String, required: true, enum: PlacedItemTypeKey })
        placedItemTypeKey: PlacedItemTypeKey
    
    @Field(() => SeedGrowthInfoSchema, { nullable: true })
    @Prop({ type: SeedGrowthInfoSchemaClass, required: false })
        seedGrowthInfo?: SeedGrowthInfoSchema

    @Field(() => TileInfo, { nullable: true })
    @Prop({ type: TileInfoSchemaClass, required: false })
        tileInfo?: TileInfo

    @Field(() => AnimalInfo, { nullable: true })
    @Prop({ type: AnimalInfoSchemaClass, required: false })
        animalInfo?: AnimalInfo

    @Field(() => BuildingInfo, { nullable: true })
    @Prop({ type: BuildingInfoSchemaClass, required: false })
        buildingInfo?: BuildingInfo
}

// Generate Mongoose Schema
export const PlacedItemSchemaClass = SchemaFactory.createForClass(PlacedItemSchema)
