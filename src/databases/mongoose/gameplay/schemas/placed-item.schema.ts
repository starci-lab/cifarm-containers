import { Field, ID, Int, ObjectType } from "@nestjs/graphql"
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { HydratedDocument, Schema as MongooseSchema } from "mongoose"
import { PlacedItemType, PlacedItemTypeId } from "../enums"
import { AbstractSchema } from "./abstract"
import { AnimalInfoSchema, AnimalInfoSchemaClass } from "./animal-info.schema"
import { BuildingInfoSchema, BuildingInfoSchemaClass } from "./building-info.schema"
import { SeedGrowthInfoSchema, SeedGrowthInfoSchemaClass } from "./seed-growth-info.schema"
import { TileInfoSchema, TileInfoSchemaClass } from "./tile-info.schema"
import { UserSchema } from "./user.schema"

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

    @Field(() => ID)
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: UserSchema.name })
        user: UserSchema
    
    @Field(() => String)
    @Prop({ type: String, enum: PlacedItemType, required: true })
        type: PlacedItemType

    @Field(() => String)
    @Prop({ type: String, required: true, enum: PlacedItemTypeId })
        placedItemType: PlacedItemTypeId
    
    @Field(() => SeedGrowthInfoSchema, { nullable: true })
    @Prop({ type: SeedGrowthInfoSchemaClass, required: false })
        seedGrowthInfo?: SeedGrowthInfoSchema

    @Field(() => TileInfoSchema, { nullable: true })
    @Prop({ type: TileInfoSchemaClass, required: false })
        tileInfo?: TileInfoSchema

    @Field(() => AnimalInfoSchema, { nullable: true })
    @Prop({ type: AnimalInfoSchemaClass, required: false })
        animalInfo?: AnimalInfoSchema

    @Field(() => BuildingInfoSchema, { nullable: true })
    @Prop({ type: BuildingInfoSchemaClass, required: false })
        buildingInfo?: BuildingInfoSchema
}

// Generate Mongoose Schema
export const PlacedItemSchemaClass = SchemaFactory.createForClass(PlacedItemSchema)
