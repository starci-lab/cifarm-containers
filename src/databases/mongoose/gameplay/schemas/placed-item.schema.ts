import { Field, ID, Int, ObjectType } from "@nestjs/graphql"
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { Schema as MongooseSchema } from "mongoose"
import { AbstractSchema } from "./abstract"
import { AnimalInfoSchema, AnimalInfoSchemaClass } from "./animal-info.schema"
import { BuildingInfoSchema, BuildingInfoSchemaClass } from "./building-info.schema"
import { SeedGrowthInfoSchema, SeedGrowthInfoSchemaClass } from "./seed-growth-info.schema"
import { TileInfoSchema, TileInfoSchemaClass } from "./tile-info.schema"
import { UserSchema } from "./user.schema"
import { PlacedItemTypeSchema } from "./placed-item-type.schema"
import {
    ANIMAL_INFO,
    BUILDING_INFO,
    FRUIT_INFO,
    PLACED_ITEM_TYPE,
    SEED_GROWTH_INFO,
    TILE_INFO
} from "../constants"
import { FruitInfoSchema, FruitInfoSchemaClass } from "./fruit-info.schema"

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
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: UserSchema.name })
        user: UserSchema | string

    @Field(() => ID, {
        description: "The type of the placed item"
    })
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: PlacedItemTypeSchema.name })
    [PLACED_ITEM_TYPE]: PlacedItemTypeSchema | string

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

    @Field(() => SeedGrowthInfoSchema, { 
        nullable: true,
        description: "The seed growth info associated with this placed item, if applicable"
    })
    @Prop({ type: SeedGrowthInfoSchemaClass, required: false })
    [SEED_GROWTH_INFO]?: SeedGrowthInfoSchema

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
}

// Generate Mongoose Schema
export const PlacedItemSchemaClass = SchemaFactory.createForClass(PlacedItemSchema)
