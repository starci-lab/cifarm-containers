import { Field, ID, Int, ObjectType } from "@nestjs/graphql"
import { Schema, SchemaFactory, Prop } from "@nestjs/mongoose"
import { USER, INVENTORY_TYPE } from "../constants"
import { AbstractSchema } from "./abstract"
import { InventoryTypeSchema } from "./inventory-type.schema"
import { UserSchema } from "./user.schema"
import { Schema as MongooseSchema } from "mongoose"
import { InventoryKind } from "../enums"

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
    [USER]: UserSchema | string

    @Field(() => Int)
    @Prop({ type: Number, required: true })
        index: number

    @Field(() => String)
    @Prop({ type: String, required: true, enum: InventoryKind })
        kind: InventoryKind
    
    @Field(() => ID)
    @Prop({ type: MongooseSchema.Types.ObjectId, required: true, ref: InventoryTypeSchema.name })
    [INVENTORY_TYPE]: InventoryTypeSchema | string
}

export const InventorySchemaClass = SchemaFactory.createForClass(InventorySchema)
