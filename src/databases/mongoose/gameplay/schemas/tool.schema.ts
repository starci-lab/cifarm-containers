import { Field, Int, ObjectType } from "@nestjs/graphql"
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { StaticAbstractSchema } from "./abstract"
import { ToolId } from "../enums"

@ObjectType()
@Schema({ timestamps: true, collection: "tools" })
export class ToolSchema extends StaticAbstractSchema<ToolId> {
    @Field(() => Int, { nullable: true })
    @Prop({ type: Number, required: false })
        sort?: number
    @Field(() => Boolean)
    @Prop({ type: Boolean, required: true, default: false })
        default: boolean
    @Field(() => Boolean, { nullable: true })
    @Prop({ type: Boolean, required: false })
        givenAsDefault?: boolean
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
export const ToolSchemaClass = SchemaFactory.createForClass(ToolSchema)
