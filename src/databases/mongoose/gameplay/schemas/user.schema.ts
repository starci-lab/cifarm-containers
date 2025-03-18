import { Field, Float, ID, Int, ObjectType } from "@nestjs/graphql"
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { AbstractSchema } from "./abstract"
import { ChainKey, Network } from "@src/env"
import { TutorialStep, LowerCaseTutorialStep } from "../enums"
import { Schema as MongooseSchema } from "mongoose"

@ObjectType({
    description: "The schema for user data"
})
@Schema({
    timestamps: true,
    collection: "users"
})
export class UserSchema extends AbstractSchema {
    @Field(() => String, {
        description: "The username of the user"
    })
    @Prop({ type: String, required: true, unique: true, length: 100 })
        username: string

    @Field(() => String, {
        description: "The blockchain chain key of the user"
    })
    @Prop({
        type: String,
        required: true,
        enum: ChainKey,
        default: ChainKey.Solana
    })
        chainKey: ChainKey

    @Field(() => String, {
        description: "The blockchain network of the user"
    })
    @Prop({
        type: String,
        required: true,
        enum: Network,
        default: Network.Testnet
    })
        network: Network

    @Field(() => String, {
        description: "The blockchain account address of the user"
    })
    @Prop({ type: String, length: 100 })
        accountAddress: string

    @Field(() => Int, {
        description: "The amount of gold currency the user has"
    })
    @Prop({ type: Number, default: 0 })
        golds: number

    @Field(() => String, { 
        nullable: true,
        description: "The URL to the user's avatar image"
    })
    @Prop({ type: String, required: false })
        avatarUrl?: string

    @Field(() => Float, {
        description: "The amount of token currency the user has"
    })
    @Prop({ type: Number, default: 0 })
        tokens: number

    @Field(() => Int, {
        description: "The experience points of the user"
    })
    @Prop({ type: Number, default: 0 })
        experiences: number

    @Field(() => Int, {
        description: "The current energy level of the user"
    })
    @Prop({ type: Number, default: 0 })
        energy: number

    @Field(() => Float, {
        description: "The time until energy regenerates"
    })
    @Prop({ type: Number, default: 0 })
        energyRegenTime: number

    @Field(() => Boolean, {
        description: "Whether the user's energy is full"
    })
    @Prop({ type: Boolean, default: true })
        energyFull: boolean

    @Field(() => Int, {
        description: "The current level of the user"
    })
    @Prop({ type: Number, default: 1 })
        level: number

    // tutorial step
    @Field(() => LowerCaseTutorialStep, {
        description: "The current tutorial step of the user"
    })
    @Prop({ type: Number, default: 0 })
        tutorialStep: TutorialStep

    @Field(() => Int, {
        description: "The current streak of daily rewards claimed"
    })
    @Prop({ type: Number, default: 0 })
        dailyRewardStreak: number

    @Field(() => Date, { 
        nullable: true,
        description: "The last time the user claimed a daily reward"
    })
    @Prop({ type: Date, required: false })
        dailyRewardLastClaimTime?: Date

    @Field(() => Date, { 
        nullable: true,
        description: "The last time the user claimed a honeycomb daily reward"
    })
    @Prop({ type: Date, required: false })
        honeycombDailyRewardLastClaimTime?: Date

    @Field(() => Date, { 
        nullable: true,
        description: "The last time the user used a spin"
    })
    @Prop({ type: Date, required: false })
        spinLastTime?: Date

    @Field(() => Int, {
        description: "The number of spins the user has used"
    })
    @Prop({ type: Number, default: 0 })
        spinCount: number

    // referral id
    @Field(() => ID, { 
        nullable: true,
        description: "The ID of the user who referred this user"
    })
    @Prop({ type: MongooseSchema.Types.ObjectId, required: false })
        referralUserId: MongooseSchema.Types.ObjectId

    @Field(() => [ID], {
        description: "The IDs of users referred by this user"
    })
    @Prop({ type: [MongooseSchema.Types.ObjectId], required: false })
        referredUserIds: Array<MongooseSchema.Types.ObjectId>
    
    @Field(() => Boolean, {
        description: "Whether the user has been awarded for following on X/Twitter"
    })
    @Prop({ type: Boolean, default: false })
        followXAwarded: boolean

    @Field(() => Boolean, {
        description: "Whether the current user is followed by the requesting user"
    })
        followed?: boolean
}

export const UserSchemaClass = SchemaFactory.createForClass(UserSchema)
