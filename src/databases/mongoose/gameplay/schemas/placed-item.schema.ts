import { Field, Float, ID, Int, ObjectType } from "@nestjs/graphql"
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { HydratedDocument } from "mongoose"
import { KeyAbstractSchema } from "./abstract"
import { AnimalCurrentState, CropCurrentState } from "../enums"

// Mongoose document type
export type PlacedItemDocument = HydratedDocument<PlacedItemSchema>

@ObjectType()
@Schema({
    timestamps: true,
    collection: "placed_items"
})
export class PlacedItemSchema extends KeyAbstractSchema {
    
    @Field(() => Int)
    @Prop({ type: Number, required: true })
        x: number

    @Field(() => Int)
    @Prop({ type: Number, required: true })
        y: number

    @Field(() => ID, { nullable: true })
    @Prop({ type: String, required: false })
        userId?: string

    @Field(() => ID, { nullable: true })
    @Prop({ type: String, required: false })
        inventoryId?: string

    @Field(() => ID, { nullable: true })
    @Prop({ type: String, required: false })
        seedGrowthInfoId?: string

    @Field(() => ID, { nullable: true })
    @Prop({ type: String, required: false })
        tileInfoId?: string

    @Field(() => ID, { nullable: true })
    @Prop({ type: String, required: false })
        animalInfoId?: string

    @Field(() => ID, { nullable: true })
    @Prop({ type: String, required: false })
        buildingInfoId?: string

    @Field(() => [ID], { nullable: true })
    @Prop({ type: [String], required: false })
        placedItemIds?: string[]

    @Field(() => ID, { nullable: true })
    @Prop({ type: String, required: false })
        parentId?: string

    @Field(() => ID, { nullable: true })
    @Prop({ type: String, required: false })
        placedItemTypeId?: string
}

@ObjectType()
export class TileInfoSchema {
    
    @Field(() => Int)
    @Prop({ type: Number, default: 0 })
        harvestCount: number

    @Field(() => ID)
    @Prop({ type: String, required: true })
        placedItemId: string
}

@ObjectType()
export class SeedGrowthInfoSchema {
    
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

    @Field(() => ID)
    @Prop({ type: String, required: true })
        cropId: string

    @Field(() => String)
    @Prop({ type: String, enum: CropCurrentState, default: CropCurrentState.Normal })
        currentState: CropCurrentState

    @Field(() => Boolean)
    @Prop({ type: Boolean, default: false })
        isFertilized: boolean

    @Field(() => ID)
    @Prop({ type: String, required: true })
        placedItemId: string
}

@ObjectType()
export class BuildingInfoSchema extends KeyAbstractSchema {
    
    @Field(() => Int)
    @Prop({ type: Number, default: 0 })
        currentUpgrade: number

    @Field(() => ID)
    @Prop({ type: String, required: true })
        placedItemId: string
}

@ObjectType()
export class AnimalInfoSchema extends KeyAbstractSchema {
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

    @Field(() => ID)
    @Prop({ type: String, required: true })
        placedItemId: string
}

// Generate Mongoose Schema
export const PlacedItemSchemaClass = SchemaFactory.createForClass(PlacedItemSchema)
