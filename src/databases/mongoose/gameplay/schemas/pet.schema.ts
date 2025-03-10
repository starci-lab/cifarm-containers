import { Field, Int, ObjectType } from "@nestjs/graphql"
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { StaticAbstractSchema } from "./abstract"
import { PetId } from "../enums"

@ObjectType()
@Schema({ timestamps: true, collection: "pets" })
export class PetSchema extends StaticAbstractSchema<PetId> {
    @Field(() => Boolean)
    @Prop({ type: Boolean, required: true, default: false })
        availableInShop: boolean
    @Field(() => Int, { nullable: true })
    @Prop({ type: Number, required: false })
        price?: number
    @Field(() => Int, { nullable: true })
    @Prop({ type: Number, required: false })
        unlockLevel?: number
}

// Generate Mongoose Schema
export const PetSchemaClass = SchemaFactory.createForClass(PetSchema)
