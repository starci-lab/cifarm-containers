import { Field, ID, ObjectType } from "@nestjs/graphql"
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { PlacedItemType } from "../enums"
import { StaticAbstractSchema } from "./abstract"
import { BuildingSchema } from "./building.schema"
import { AnimalSchema } from "./animal.schema"
import { Schema as MongooseSchema } from "mongoose"
import { TileSchema } from "./tile.schema"

@ObjectType()
@Schema({
    timestamps: true,
    collection: "placed_item_types",
})
export class PlacedItemTypeSchema extends StaticAbstractSchema {
    @Field(() => String)
    @Prop({ type: String, enum: PlacedItemType, required: true })
        type: PlacedItemType

    @Field(() => ID, { nullable: true })
    @Prop({ type: MongooseSchema.Types.ObjectId, required: false, ref: BuildingSchema.name })
        building: BuildingSchema | string
            
    @Field(() => ID, { nullable: true })
    @Prop({ type: MongooseSchema.Types.ObjectId, required: false, ref: AnimalSchema.name })
        animal: AnimalSchema | string

    @Field(() => ID, { nullable: true })
    @Prop({ type: MongooseSchema.Types.ObjectId, required: false, ref: TileSchema.name })
        tile: TileSchema | string
}

// Generate Mongoose Schema
export const PlacedItemTypeSchemaClass = SchemaFactory.createForClass(PlacedItemTypeSchema)
