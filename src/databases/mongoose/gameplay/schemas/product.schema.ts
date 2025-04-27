import { Field, ID, Int, ObjectType } from "@nestjs/graphql"
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { ProductId, ProductType, GraphQLTypeProductId, GraphQLTypeProductType } from "../enums"
import { AbstractSchema } from "./abstract"
import { Schema as MongooseSchema, Types } from "mongoose"
import { CropSchema } from "./crop.schema"
import { AnimalSchema } from "./animal.schema"
import { FruitSchema } from "./fruit.schema"
import { CROP, ANIMAL, FRUIT, FLOWER, BUILDING } from "../constants"
import { FlowerSchema } from "./flower.schema"
import { BuildingSchema } from "./building.schema"

@ObjectType({
    description: "The product schema"
})
@Schema({ timestamps: true, collection: "products" })
export class ProductSchema extends AbstractSchema {
    @Field(() => GraphQLTypeProductId, {
        description: "The display ID of the product"
    })
    @Prop({ type: String, enum: ProductId, required: true, unique: true })
        displayId: ProductId

    @Field(() => Int, {
        description: "The maximum stack size of the product"
    })
    @Prop({ type: Number, required: true })
        maxStack: number

    @Field(() => Boolean, {
        description: "Whether the product is a quality product"
    })
    @Prop({ type: Boolean, required: true })
        isQuality: boolean

    @Field(() => ID, { nullable: true, description: "The base product that this is a quality version of" })  
    @Prop({ type: MongooseSchema.Types.ObjectId, required: false, ref: ProductSchema.name })  
        qualityVersionOf?: ProductSchema | Types.ObjectId

    @Field(() => Int, {
        description: "The amount of gold the product is worth"
    })
    @Prop({ type: Number, required: true })
        goldAmount: number

    @Field(() => GraphQLTypeProductType, {
        description: "The type of the product"
    })
    @Prop({ type: String, enum: ProductType, required: true })
        type: ProductType

    @Field(() => ID, { 
        nullable: true,
        description: "The crop associated with this product, if applicable"
    })
    @Prop({ type: MongooseSchema.Types.ObjectId, required: false, ref: CropSchema.name })
    [CROP]: CropSchema | Types.ObjectId
        
    @Field(() => ID, { 
        nullable: true,
        description: "The animal associated with this product, if applicable"
    })
    @Prop({ type: MongooseSchema.Types.ObjectId, required: false, ref: AnimalSchema.name })
    [ANIMAL]: AnimalSchema | Types.ObjectId

    @Field(() => ID, { 
        nullable: true,
        description: "The fruit associated with this product, if applicable"
    })
    @Prop({ type: MongooseSchema.Types.ObjectId, required: false, ref: FruitSchema.name })
    [FRUIT]: FruitSchema | Types.ObjectId

    @Field(() => ID, { 
        nullable: true,
        description: "The fruit associated with this product, if applicable"
    })
    @Prop({ type: MongooseSchema.Types.ObjectId, required: false, ref: FlowerSchema.name })
    [FLOWER]: FlowerSchema | Types.ObjectId

    @Field(() => ID, { 
        nullable: true,
        description: "The building associated with this product, if applicable"
    })
    @Prop({ type: MongooseSchema.Types.ObjectId, required: false, ref: BuildingSchema.name })
    [BUILDING]: BuildingSchema | Types.ObjectId
}

// Generate Mongoose Schema
export const ProductSchemaClass = SchemaFactory.createForClass(ProductSchema)
