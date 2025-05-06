import { Field, ObjectType } from "@nestjs/graphql"
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { AbstractSchema } from "./abstract"
import { GraphQLTypeOauthProviderName, OauthProviderName } from "../enums"

// this schema will link the oath provider to an mnemonic
@ObjectType({
    description: "The oath provider"
})
@Schema({ timestamps: true, collection: "oath-provider" })
export class OathProviderSchema extends AbstractSchema {
    @Field(() => String, {
        description: "Mnemonic of the oath provider"
    })
    @Prop({ type: String, required: true })
        mnemonic: string

    @Field(() => GraphQLTypeOauthProviderName, {
        description: "The name of the oath provider",
        nullable: true
    })
    @Prop({ type: String, required: false, enum: OauthProviderName })
        name?: OauthProviderName

    @Field(() => String, {
        description: "The id of the oath provider"
    })
    @Prop({ type: String, required: true })
        id: string
}

// Generate Mongoose Schema
export const OathProviderSchemaClass = SchemaFactory.createForClass(OathProviderSchema)
