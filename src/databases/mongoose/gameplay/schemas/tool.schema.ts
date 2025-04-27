import { Field, Int, ObjectType } from "@nestjs/graphql"
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { AbstractSchema } from "./abstract"
import { ToolId, GraphQLTypeToolId } from "../enums"

@ObjectType({
    description: "The tool schema"
})
@Schema({ timestamps: true, collection: "tools" })
export class ToolSchema extends AbstractSchema {
    @Field(() => GraphQLTypeToolId, {
        description: "The display ID of the tool"
    })
    @Prop({ type: String, enum: ToolId, required: true, unique: true })
        displayId: ToolId
    @Field(() => Int, { 
        nullable: true,
        description: "The sort order of the tool"
    })
    @Prop({ type: Number, required: false })
        sort?: number
    @Field(() => Boolean, {
        description: "Whether this is the default tool"
    })
    @Prop({ type: Boolean, required: true, default: false })
        default: boolean
    @Field(() => Boolean, { 
        nullable: true,
        description: "Whether this tool is given as default to new users"
    })
    @Prop({ type: Boolean, required: false })
        givenAsDefault?: boolean
    @Field(() => Boolean, {
        description: "Whether the tool is available in the shop"
    })
    @Prop({ type: Boolean, required: true, default: false })
        availableInShop: boolean
    @Field(() => Int, { 
        nullable: true,
        description: "The price of the tool"
    })
    @Prop({ type: Number, required: false })
        price?: number
    @Field(() => Int, { 
        nullable: true,
        description: "The level required to unlock this tool"
    })
    @Prop({ type: Number, required: false })
        unlockLevel?: number
}

// Generate Mongoose Schema
export const ToolSchemaClass = SchemaFactory.createForClass(ToolSchema)
