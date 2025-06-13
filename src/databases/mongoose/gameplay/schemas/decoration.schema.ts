import { Field, Int, ObjectType } from "@nestjs/graphql"
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { AbstractSchema } from "./abstract"
import { DecorationId, DecorationType, GraphQLTypeDecorationType, GraphQLTypeDecorationId } from "../enums"

@ObjectType({
    description: "The terrain schema"
})
@Schema({ timestamps: true, collection: "decorations" })
export class DecorationSchema extends AbstractSchema {
    @Field(() => GraphQLTypeDecorationId, {
        description: "The display ID of the terrain"
    })
    @Prop({ type: String, enum: DecorationId, required: true, unique: true })
        displayId: DecorationId
    @Field(() => Boolean, {
        description: "Whether the terrain is available in the shop"
    })
    @Prop({ type: Boolean, required: true, default: false })
        availableInShop: boolean
    @Field(() => Int, { 
        nullable: true,
        description: "The price of the terrain"
    })
    @Prop({ type: Number, required: false })
        price?: number

    @Field(() => Int, { 
        nullable: true,
        description: "The sell price of the terrain"
    })
    @Prop({ type: Number, required: false, default: 0 })
        sellPrice?: number

    @Field(() => GraphQLTypeDecorationType, {
        description: "The type of the decoration"
    })
    @Prop({ type: String, enum: DecorationType, required: true, unique: true })
        type: DecorationType

    @Field(() => Boolean, {
        description: "Whether the terrain is sellable"
    })
    @Prop({ type: Boolean, required: false })
        sellable?: boolean

    @Field(() => Boolean, {
        description: "Whether the decoration is limited"
    })
    @Prop({ type: Boolean, required: false, default: false })
        limited?: boolean
}

// Generate Mongoose Schema
export const DecorationSchemaClass = SchemaFactory.createForClass(DecorationSchema)
