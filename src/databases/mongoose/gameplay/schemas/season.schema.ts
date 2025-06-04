import { Field, ObjectType } from "@nestjs/graphql"
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { AbstractSchema } from "./abstract"
import { GraphQLTypeSeasonId, SeasonId } from "../enums"
import { BulkSchema, BulkSchemaClass } from "./bulk.schema"
@ObjectType({
    description: "The season schema"
})
@Schema({ timestamps: true, collection: "seasons" })
export class SeasonSchema extends AbstractSchema {
    @Field(() => GraphQLTypeSeasonId, {
        description: "The display ID of the season"
    })
    @Prop({ type: String, enum: SeasonId, required: true, unique: true })
        displayId: SeasonId
    
    @Field(() => Date, {
        description: "The start date of the season"
    })
    @Prop({ type: Date, required: true })
        startDate: Date

    @Field(() => Date, {
        description: "The end date of the season"
    })
    @Prop({ type: Date, required: true })
        endDate: Date
       
    @Field(() => String, {
        description: "The name of the season"
    })
    @Prop({ type: String, required: true })
        name: string

    @Field(() => String, {
        description: "The description of the season"
    })
    @Prop({ type: String, required: true })
        description: string   

    @Field(() => [BulkSchema], {
        description: "The bulk products of the season"
    })
    @Prop({ type: [BulkSchemaClass], required: true })
        bulks: Array<BulkSchema>

    @Field(() => Boolean, {
        description: "The supply of the season"
    })
    @Prop({ type: Boolean, required: true })
        active: boolean
}

// Generate Mongoose Schema
export const SeasonSchemaClass = SchemaFactory.createForClass(SeasonSchema)
