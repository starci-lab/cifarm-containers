import { Field, ID, ObjectType } from "@nestjs/graphql"
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { PlacedItemType, PlacedItemTypeId } from "../enums"
import { StaticAbstractSchema } from "./abstract"
import { BuildingSchema } from "./building.schema"
import { AnimalSchema } from "./animal.schema"
import { Schema as MongooseSchema } from "mongoose"
import { TileSchema } from "./tile.schema"
import { ANIMAL, BUILDING, PET, TILE } from "../constants"
import { PetSchema } from "./pet.schema"

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
}

// Generate Mongoose Schema
export const PlacedItemTypeSchemaClass = SchemaFactory.createForClass(PlacedItemTypeSchema)
