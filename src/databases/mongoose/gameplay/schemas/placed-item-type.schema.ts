import { Field, ID, Int, ObjectType } from "@nestjs/graphql"
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { PlacedItemType, PlacedItemTypeId } from "../enums"
import { AbstractSchema } from "./abstract"
import { BuildingSchema } from "./building.schema"
import { AnimalSchema } from "./animal.schema"
import { Schema as MongooseSchema } from "mongoose"
import { TileSchema } from "./tile.schema"
import { ANIMAL, BUILDING, FRUIT, PET, TILE } from "../constants"
import { PetSchema } from "./pet.schema"
import { FruitSchema } from "./fruit.schema"

@ObjectType({
    description: "The placed item type schema"
})
@Schema({
    timestamps: true,
    collection: "placed-item-types",
})
export class PlacedItemTypeSchema extends AbstractSchema {
    @Field(() => PlacedItemTypeId, {
        description: "The display ID of the placed item type"
    })
    @Prop({ type: String, enum: PlacedItemTypeId, required: true, unique: true })
        displayId: PlacedItemTypeId

    @Field(() => PlacedItemType, {
        description: "The type of the placed item type"
    })
    @Prop({ type: String, enum: PlacedItemType, required: true })
        type: PlacedItemType

    @Field(() => Boolean, {
        description: "Whether the placed item can be sold"
    })
    @Prop({ type: Boolean, default: false })
        sellable: boolean

    @Field(() => ID, { 
        nullable: true,
        description: "The building associated with this placed item type, if applicable"
    })
    @Prop({ type: MongooseSchema.Types.ObjectId, required: false, ref: BuildingSchema.name })
    [BUILDING]: BuildingSchema | string
            
    @Field(() => ID, { 
        nullable: true,
        description: "The animal associated with this placed item type, if applicable"
    })
    @Prop({ type: MongooseSchema.Types.ObjectId, required: false, ref: AnimalSchema.name })
    [ANIMAL]: AnimalSchema | string

    @Field(() => ID, { 
        nullable: true,
        description: "The tile associated with this placed item type, if applicable"
    })
    @Prop({ type: MongooseSchema.Types.ObjectId, required: false, ref: TileSchema.name })
    [TILE]: TileSchema | string

    @Field(() => ID, { 
        nullable: true,
        description: "The pet associated with this placed item type, if applicable"
    })
    @Prop({ type: MongooseSchema.Types.ObjectId, required: false, ref: PetSchema.name })
    [PET]: PetSchema | string

    @Field(() => ID, { 
        nullable: true,
        description: "The fruit associated with this placed item type, if applicable"
    })
    @Prop({ type: MongooseSchema.Types.ObjectId, required: false, ref: FruitSchema.name })
    [FRUIT]: FruitSchema | string

    @Field(() => Int, {
        description: "The width of the placed item in grid cells"
    })
    @Prop({ type: Number, required: true, default: 1 })
        sizeX: number
    
    @Field(() => Int, {
        description: "The height of the placed item in grid cells"
    })
    @Prop({ type: Number, required: true, default: 1 })
        sizeY: number
}

// Generate Mongoose Schema
export const PlacedItemTypeSchemaClass = SchemaFactory.createForClass(PlacedItemTypeSchema)
