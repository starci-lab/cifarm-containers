import { Field, ID, Int, ObjectType } from "@nestjs/graphql"
import { Schema, SchemaFactory, Prop } from "@nestjs/mongoose"
import { USER, INVENTORY_TYPE } from "../constants"
import { AbstractSchema } from "./abstract"
import { InventoryTypeSchema } from "./inventory-type.schema"
import { UserSchema } from "./user.schema"
import { Schema as MongooseSchema, Types } from "mongoose"
import { InventoryKind, GraphQLTypeInventoryKind } from "../enums"

@ObjectType({
    description: "The schema for inventory items",
})
@Schema({
    timestamps: true,
    collection: "inventories",
})
export class InventorySchema extends AbstractSchema {
    @Field(() => Int, { 
        nullable: true,
        description: "The quantity of the inventory item"
    })
    @Prop({ type: Number, required: false })
        quantity?: number

    @Field(() => ID, {
        description: "The user who owns this inventory item"
    })
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: UserSchema.name, index: true })
    [USER]: UserSchema | Types.ObjectId

    @Field(() => Int, {
        description: "The index position of the inventory item"
    })
    @Prop({ type: Number, required: true })
        index: number

    @Field(() => GraphQLTypeInventoryKind, {
        description: "The kind of inventory item"
    })
    @Prop({ type: String, required: true, enum: InventoryKind })
        kind: InventoryKind
    
    @Field(() => ID, {
        description: "The inventory type reference"
    })
    @Prop({ type: MongooseSchema.Types.ObjectId, required: true, ref: InventoryTypeSchema.name })
    [INVENTORY_TYPE]: InventoryTypeSchema | Types.ObjectId
}

export const InventorySchemaClass = SchemaFactory.createForClass(InventorySchema)