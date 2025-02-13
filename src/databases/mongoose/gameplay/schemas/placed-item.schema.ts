import { Field, Float, Int, ObjectType } from "@nestjs/graphql"
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { HydratedDocument } from "mongoose"
import { AbstractSchema } from "./abstract"
import { AnimalCurrentState, PlacedItemTypeKey } from "../enums"
import { SeedGrowthInfoSchema, SeedGrowthInfoSchemaClass } from "./seed-growth-info.schema"
import { TileInfoSchema, TileInfoSchemaClass } from "./tile-info.schema"

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

    @Field(() => TileInfoSchema, { nullable: true })
    @Prop({ type: TileInfoSchemaClass, required: false })
        tileInfo?: TileInfoSchema

    @Field(() => AnimalInfo, { nullable: true })
    @Prop({ type: AnimalInfoSchemaClass, required: false })
        animalInfo?: AnimalInfo

    @Field(() => BuildingInfo, { nullable: true })
    @Prop({ type: BuildingInfoSchemaClass, required: false })
        buildingInfo?: BuildingInfo
}

// Generate Mongoose Schema
export const PlacedItemSchemaClass = SchemaFactory.createForClass(PlacedItemSchema)
