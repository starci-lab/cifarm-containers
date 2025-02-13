import { Field, ID, Int, ObjectType } from "@nestjs/graphql"
import { HydratedDocument } from "mongoose"
import { AbstractSchema } from "./abstract"
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { AvailableInType, InventoryType } from "../enums"
import { CropSchema } from "./crop.schema"
import { Schema as MongooseSchema } from "mongoose"
import { ProductSchema } from "./product.schema"
import { ToolSchema } from "./tool.schema"
import { SupplySchema } from "./supply.schema"

export type InventoryTypeDocument = HydratedDocument<InventoryTypeSchema>

@ObjectType()
@Schema({
    timestamps: true,
    collection: "inventory-types"
})
export class InventoryTypeSchema extends AbstractSchema {
    @Field(() => String)
    @Prop({ type: String, required: true, enum: InventoryType })
        type: InventoryType

    @Field(() => ID, { nullable: true })
    @Prop({ type: MongooseSchema.Types.ObjectId, required: false, ref: CropSchema.name })
        crop: CropSchema | string
    
    @Field(() => ID, { nullable: true })
    @Prop({ type: MongooseSchema.Types.ObjectId, required: false, ref: ProductSchema.name })
        product: ProductSchema | string

    @Field(() => ID, { nullable: true })
    @Prop({ type: MongooseSchema.Types.ObjectId, required: false, ref: ToolSchema.name })
        tool: ToolSchema | string

    @Field(() => ID, { nullable: true })
    @Prop({ type: MongooseSchema.Types.ObjectId, required: false, ref: SupplySchema.name })
        supply: SupplySchema | string

    @Field(() => Boolean)
    @Prop({ type: Boolean, required: true })
        placeable: boolean

    @Field(() => Boolean)
    @Prop({ type: Boolean, required: true })
        deliverable: boolean

    @Field(() => Boolean)
    @Prop({ type: Boolean, required: true })
        asTool: boolean

    @Field(() => String, { nullable: true })
    @Prop({ type: String, required: false, enum: AvailableInType })
        availableIn?: AvailableInType

    @Field(() => Int)
        @Prop({ type: Number, required: true, min: 1 })
        maxStack: number
}

export const InventoryTypeSchemaClass = SchemaFactory.createForClass(InventoryTypeSchema)