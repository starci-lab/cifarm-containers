import { Field, Float, Int, ObjectType, ID } from "@nestjs/graphql"
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { AbstractSchema } from "./abstract"
import { GraphQLTypeTokenKey, TokenKey } from "../enums"
import { Types } from "mongoose"

@ObjectType({
    description: "Bulk product"
})
export class BulkProduct {
    @Field(() => ID, {
        description: "Product id"
    })
        productId: Types.ObjectId

    @Field(() => Int, {
        description: "Product quantity"
    })
        quantity: number
}

@ObjectType({
    description: "The bulk schema"
})
@Schema({ timestamps: true, autoCreate: false })
export class BulkSchema extends AbstractSchema {
    @Field(() => String, {
        description: "Bulk name"
    })
    @Prop({ type: String, required: true })
        bulkName: string    

    @Field(() => String, {
        description: "Bulk description"
    })
    @Prop({ type: String, required: true })
        description: string

    @Field(() => [BulkProduct], {
        description: "Bulk products"
    })
    @Prop({ type: [BulkProduct], required: true })
        products: Array<BulkProduct>

    @Field(() => Float, {
        description: "Bulk max paid amount"
    })
    @Prop({ type: Number, required: true })
        maxPaidAmount: number

    @Field(() => Float, {
        description: "Bulk max paid percentage"
    })
    @Prop({ type: Number, required: true })
        maxPaidPercentage: number

    @Field(() => GraphQLTypeTokenKey, {
        description: "Wholesale market bulk token key"
    })
    @Prop({ type: String, enum: TokenKey, required: true })
        tokenKey: TokenKey

    @Field(() => Float, {
        description: "Bulk tCIFARM"
    })
    @Prop({ type: Number, required: true })
        tCIFARM: number

    @Field(() => Float, {
        description: "Bulk decrement percentage"
    })
    @Prop({ type: Number, required: true })
        decrementPercentage: number
}

// Generate Mongoose Schema
export const BulkSchemaClass = SchemaFactory.createForClass(BulkSchema)