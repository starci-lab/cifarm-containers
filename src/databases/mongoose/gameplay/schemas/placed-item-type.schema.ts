import { Field, ObjectType } from "@nestjs/graphql"
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { HydratedDocument } from "mongoose"
import { PlacedItemType } from "../enums"
import { KeyAbstractSchema } from "./abstract"

// Mongoose document type
export type PlacedItemTypeDocument = HydratedDocument<PlacedItemTypeSchema>

@ObjectType()
@Schema({
    timestamps: true,
    collection: "placed_item_types",
    id: false
})
export class PlacedItemTypeSchema extends KeyAbstractSchema {
    
    @Field(() => String)
    @Prop({ type: String, enum: PlacedItemType, required: true })
        type: PlacedItemType

    @Field(() => String, { nullable: true })
    @Prop({ type: String, required: false })
        tileKey?: string

    @Field(() => String, { nullable: true })
    @Prop({ type: String, required: false })
        buildingKey?: string

    @Field(() => String, { nullable: true })
    @Prop({ type: String, required: false })
        animalKey?: string
}

// Generate Mongoose Schema
export const PlacedItemTypeSchemaClass = SchemaFactory.createForClass(PlacedItemTypeSchema)
