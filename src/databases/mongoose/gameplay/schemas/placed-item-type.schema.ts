import { Field, ID, Int, ObjectType } from "@nestjs/graphql"
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { PlacedItemType, PlacedItemTypeId } from "../enums"
import { StaticAbstractSchema } from "./abstract"
import { BuildingSchema } from "./building.schema"
import { AnimalSchema } from "./animal.schema"
import { Schema as MongooseSchema } from "mongoose"
import { TileSchema } from "./tile.schema"
import { ANIMAL, BUILDING, FRUIT, PET, TILE } from "../constants"
import { PetSchema } from "./pet.schema"
import { FruitSchema } from "./fruit.schema"

@ObjectType()
@Schema({
    timestamps: true,
    collection: "placed-item-types",
})
export class PlacedItemTypeSchema extends StaticAbstractSchema<PlacedItemTypeId> {
    @Field(() => String)
    @Prop({ type: String, enum: PlacedItemType, required: true })
        type: PlacedItemType

    @Field(() => Boolean)
    @Prop({ type: Boolean, default: false })
        sellable: boolean

    @Field(() => ID, { nullable: true })
    @Prop({ type: MongooseSchema.Types.ObjectId, required: false, ref: BuildingSchema.name })
    [BUILDING]: BuildingSchema | string
            
    @Field(() => ID, { nullable: true })
    @Prop({ type: MongooseSchema.Types.ObjectId, required: false, ref: AnimalSchema.name })
    [ANIMAL]: AnimalSchema | string

    @Field(() => ID, { nullable: true })
    @Prop({ type: MongooseSchema.Types.ObjectId, required: false, ref: TileSchema.name })
    [TILE]: TileSchema | string

    @Field(() => ID, { nullable: true })
    @Prop({ type: MongooseSchema.Types.ObjectId, required: false, ref: PetSchema.name })
    [PET]: PetSchema | string

    @Field(() => ID, { nullable: true })
    @Prop({ type: MongooseSchema.Types.ObjectId, required: false, ref: FruitSchema.name })
    [FRUIT]: FruitSchema | string

    @Field(() => Int)
    @Prop({ type: Number, required: true, default: 1 })
        sizeX: number
    
    @Field(() => Int)
    @Prop({ type: Number, required: true, default: 1 })
        sizeY: number
}

// Generate Mongoose Schema
export const PlacedItemTypeSchemaClass = SchemaFactory.createForClass(PlacedItemTypeSchema)
