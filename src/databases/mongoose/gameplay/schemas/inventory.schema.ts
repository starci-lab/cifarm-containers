import { Field, ID, Int, ObjectType } from "@nestjs/graphql"
import { Schema as MongooseSchema } from "mongoose"
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { AbstractSchema } from "./abstract"
import { UserSchema } from "./user.schema"
import { InventoryTypeSchema } from "./inventory-type.schema"
import { INVENTORY_TYPE } from "../constants"

@ObjectType()
@Schema({
    timestamps: true,
    collection: "inventories"
})
export class InventorySchema extends AbstractSchema {
    @Field(() => Int, { nullable: true })
    @Prop({ type: Number, required: false })
        quantity?: number

    @Field(() => ID)
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: UserSchema.name })
        user: UserSchema | string
    
    @Field(() => Boolean, { nullable: true })
    @Prop({ type: Boolean, required: false })
        inToolbar?: boolean
    
    @Field(() => Int)
    @Prop({ type: Number, required: true })
        index: number

    @Field(() => ID)
    @Prop({ type: MongooseSchema.Types.ObjectId, required: true, ref: InventoryTypeSchema.name })
    [INVENTORY_TYPE]: InventoryTypeSchema | string
}

export const InventorySchemaClass = SchemaFactory.createForClass(InventorySchema)