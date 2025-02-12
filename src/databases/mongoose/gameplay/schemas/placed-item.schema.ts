import { Field, Float, ID, Int, ObjectType } from "@nestjs/graphql"
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { HydratedDocument } from "mongoose"
import { AbstractSchema } from "./abstract"
import { AnimalCurrentState, CropCurrentState, PlacedItemTypeKey } from "../enums"
import { Position } from "@src/gameplay"

// Mongoose document type
export type PlacedItemDocument = HydratedDocument<PlacedItemSchema>;

@ObjectType()
@Schema({ timestamps: true, collection: "placed-items" })
export class PlacedItemSchema extends AbstractSchema {
    @Field(() => Position)
    @Prop({ type: Object, required: true, default: { x: 0, y: 0 } })
        position: Position

    @Field(() => String, { nullable: true })
    @Prop({ type: String, required: false })
        inventoryId?: string

    @Field(() => String)
    @Prop({ type: String, required: true, enum: PlacedItemTypeKey })
        placedItemTypeKey: PlacedItemTypeKey
    
    @Field(() => SeedGrowthInfo, { nullable: true })
    @Prop({ type: Object, required: false })
        seedGrowthInfo?: SeedGrowthInfo

    @Field(() => TileInfo, { nullable: true })
    @Prop({ type: Object, required: false })
        tileInfo?: TileInfo

    @Field(() => AnimalInfo, { nullable: true })
    @Prop({ type: Object, required: false })
        animalInfo?: AnimalInfo

    @Field(() => BuildingInfo, { nullable: true })
    @Prop({ type: Object, required: false })
        buildingInfo?: BuildingInfo
}

@ObjectType()
export class TileInfo {
    
    @Field(() => Int)
    @Prop({ type: Number, default: 0 })
        harvestCount: number

    @Field(() => ID)
    @Prop({ type: String, required: true })
        placedItemId: string
}

@ObjectType()
export class SeedGrowthInfo {
    
    @Field(() => Int)
    @Prop({ type: Number, default: 0 })
        currentStage: number

    @Field(() => Float)
    @Prop({ type: Number, default: 0 })
        currentStageTimeElapsed: number

    @Field(() => Int)
    @Prop({ type: Number, default: 0 })
        currentPerennialCount: number

    @Field(() => Int)
    @Prop({ type: Number })
        harvestQuantityRemaining: number

    @Field(() => Int)
    @Prop({ type: Number, default: 0 })
        harvestCount: number

    @Field(() => Boolean)
    @Prop({ type: Boolean, default: false })
        isQuality: boolean

    @Field(() => String)
    @Prop({ type: String, required: true })
        cropKey: string

    @Field(() => String)
    @Prop({ type: String, enum: CropCurrentState, default: CropCurrentState.Normal })
        currentState: CropCurrentState

    @Field(() => Boolean)
    @Prop({ type: Boolean, default: false })
        isFertilized: boolean
}

@ObjectType()
export class BuildingInfo {
    @Field(() => Int)
    @Prop({ type: Number, default: 0 })
        currentUpgrade: number

    @Field(() => String)
    @Prop({ type: String, required: true })
        placedItemId: string
}

@ObjectType()
export class AnimalInfo {
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

// Generate Mongoose Schema
export const PlacedItemSchemaClass = SchemaFactory.createForClass(PlacedItemSchema)
