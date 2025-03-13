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

@ObjectType()
@Schema({ timestamps: true, collection: "placed-items" })
export class PlacedItemSchema extends AbstractSchema {
    @Field(() => Int)
    @Prop({ type: Number, required: true })
        x: number

    @Field(() => Int)
    @Prop({ type: Number, required: true })
        y: number

    @Field(() => ID)
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: UserSchema.name })
        user: UserSchema | string

    @Field(() => ID)
    @Prop({ type: MongooseSchema.Types.ObjectId, required: true, ref: PlacedItemTypeSchema.name })
    [PLACED_ITEM_TYPE]: PlacedItemTypeSchema | string

    @Field(() => SeedGrowthInfoSchema, { nullable: true })
    @Prop({ type: SeedGrowthInfoSchemaClass, required: false })
    [SEED_GROWTH_INFO]?: SeedGrowthInfoSchema

    @Field(() => TileInfoSchema, { nullable: true })
    @Prop({ type: TileInfoSchemaClass, required: false })
    [TILE_INFO]?: TileInfoSchema

    @Field(() => AnimalInfoSchema, { nullable: true })
    @Prop({ type: AnimalInfoSchemaClass, required: false })
    [ANIMAL_INFO]?: AnimalInfoSchema

    @Field(() => BuildingInfoSchema, { nullable: true })
    @Prop({ type: BuildingInfoSchemaClass, required: false })
    [BUILDING_INFO]?: BuildingInfoSchema

    @Field(() => FruitInfoSchema, { nullable: true })
    @Prop({ type: FruitInfoSchemaClass, required: false })
    [FRUIT_INFO]?: FruitInfoSchema
}

// Generate Mongoose Schema
export const PlacedItemSchemaClass = SchemaFactory.createForClass(PlacedItemSchema)
