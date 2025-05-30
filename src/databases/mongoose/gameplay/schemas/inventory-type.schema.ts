import { Field, ID, Int, ObjectType } from "@nestjs/graphql"
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import {
    InventoryType,
    InventoryTypeId,
    GraphQLTypeInventoryType,
    GraphQLTypeInventoryTypeId,
    PlantType,
    GraphQLTypePlantType
} from "../enums"
import { CropSchema } from "./crop.schema"
import { Schema as MongooseSchema, Types } from "mongoose"
import { ProductSchema } from "./product.schema"
import { CROP, FLOWER, PRODUCT, SUPPLY, TOOL } from "../constants"
import { ToolSchema } from "./tool.schema"
import { SupplySchema } from "./supply.schema"
import { AbstractSchema } from "./abstract"
import { FlowerSchema } from "./flower.schema"

@ObjectType({
    description: "The inventory type schema"
})
@Schema({
    timestamps: true,
    collection: "inventory-types"
})
export class InventoryTypeSchema extends AbstractSchema {
    @Field(() => GraphQLTypeInventoryTypeId, {
        description: "The display ID of the inventory type"
    })
    @Prop({ type: String, enum: InventoryTypeId, required: true, unique: true })
        displayId: InventoryTypeId

    @Field(() => GraphQLTypeInventoryType, {
        description: "The type of the inventory type"
    })
    @Prop({ type: String, enum: InventoryType })
        type: InventoryType

    @Field(() => ID, {
        description: "The crop ID",
        nullable: true
    })
    @Prop({ type: MongooseSchema.Types.ObjectId, required: false, ref: CropSchema.name })
    [CROP]: CropSchema | Types.ObjectId

    @Field(() => ID, {
        description: "The flower ID",
        nullable: true
    })
    @Prop({ type: MongooseSchema.Types.ObjectId, required: false, ref: FlowerSchema.name })
    [FLOWER]: FlowerSchema | Types.ObjectId

    @Field(() => GraphQLTypePlantType, {
        description: "The seed type",
        nullable: true
    })
    @Prop({ type: String, enum: PlantType, required: false })
        seedType?: PlantType

    @Field(() => ID, {
        description: "The product ID",
        nullable: true
    })
    @Prop({ type: MongooseSchema.Types.ObjectId, required: false, ref: ProductSchema.name })
    [PRODUCT]: ProductSchema | Types.ObjectId

    @Field(() => ID, {
        description: "The tool ID",
        nullable: true
    })
    @Prop({ type: MongooseSchema.Types.ObjectId, required: false, ref: ToolSchema.name })
    [TOOL]: ToolSchema | Types.ObjectId

    @Field(() => ID, {
        description: "The supply ID",
        nullable: true
    })
    @Prop({ type: MongooseSchema.Types.ObjectId, required: false, ref: SupplySchema.name })
    [SUPPLY]: SupplySchema | Types.ObjectId

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
