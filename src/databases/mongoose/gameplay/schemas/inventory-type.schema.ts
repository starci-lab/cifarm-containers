import { Field, ID, Int, ObjectType } from "@nestjs/graphql"
import { StaticAbstractSchema } from "./abstract"
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { AvailableInType, InventoryType, InventoryTypeId } from "../enums"
import { CropSchema } from "./crop.schema"
import { Schema as MongooseSchema } from "mongoose"
import { ProductSchema } from "./product.schema"
import { CROP, PRODUCT, SUPPLY, TOOL } from "../constants"
import { ToolSchema } from "./tool.schema"
import { SupplySchema } from "./supply.schema"

@ObjectType({
    description: "The schema for inventory type"
})
@Schema({
    timestamps: true,
    collection: "inventory-types"
})
export class InventoryTypeSchema extends StaticAbstractSchema<InventoryTypeId> {
    @Field(() => String, {
        description: "The type of the inventory"
    })
    @Prop({ type: String, required: true, enum: InventoryType })
        type: InventoryType

    @Field(() => ID, {
        description: "The crop ID",
        nullable: true
    })
    @Prop({ type: MongooseSchema.Types.ObjectId, required: false, ref: CropSchema.name })
    [CROP]: CropSchema | string
    
    @Field(() => ID, {
        description: "The product ID",
        nullable: true
    })
    @Prop({ type: MongooseSchema.Types.ObjectId, required: false, ref: ProductSchema.name })
    [PRODUCT]: ProductSchema | string

    @Field(() => ID, {
        description: "The tool ID",
        nullable: true
    })
    @Prop({ type: MongooseSchema.Types.ObjectId, required: false, ref: ToolSchema.name })
    [TOOL]: ToolSchema | string

    @Field(() => ID, {
        description: "The supply ID",
        nullable: true
    })
    @Prop({ type: MongooseSchema.Types.ObjectId, required: false, ref: SupplySchema.name })
    [SUPPLY]: SupplySchema | string

    @Field(() => Boolean, {
        description: "Whether the inventory is placeable"
    })
    @Prop({ type: Boolean, required: true })
        placeable: boolean

    @Field(() => Boolean, {
        description: "Whether the inventory is deliverable"
    })
    @Prop({ type: Boolean, required: true })
        deliverable: boolean

    @Field(() => Boolean, {
        description: "Whether the inventory is as tool"
    })
    @Prop({ type: Boolean, required: true })
        asTool: boolean

    @Field(() => String, {
        description: "The available in type",
        nullable: true
    })
    @Prop({ type: String, required: false, enum: AvailableInType })
        availableIn?: AvailableInType

    @Field(() => Boolean, {
        description: "Whether the inventory is stackable"
    })
    @Prop({ type: Boolean, required: true, default: true })
        stackable: boolean

    @Field(() => Int, {
        description: "The maximum stack of the inventory",
        nullable: true
    })
    @Prop({ type: Number, required: false, min: 1 })
        maxStack?: number
}

export const InventoryTypeSchemaClass = SchemaFactory.createForClass(InventoryTypeSchema)