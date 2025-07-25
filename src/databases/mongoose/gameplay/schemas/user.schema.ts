import { Field, Float, ID, Int, ObjectType } from "@nestjs/graphql"
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { AbstractSchema } from "./abstract"
import { GraphQLTypeNetwork, Network } from "@src/env"
import { Schema as MongooseSchema, Types } from "mongoose"
import { OauthProviderName } from "../enums"
import { TutorialSchema, TutorialSchemaClass } from "./tutorial.schema"

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
    @Prop({ 
        type: String,
        required: true,
        length: 20,
        //no unique because we run multiple network here
        //unique: true,
        index: true
    })
        username: string

    @Field(() => GraphQLTypeNetwork, {
        description: "The blockchain network of the user"
    })
    @Prop({
        type: String,
        required: true,
        enum: Network,
        default: Network.Testnet
    })
        network: Network

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
        referralUserId?: Types.ObjectId

    @Field(() => [ID], {
        description: "The IDs of users referred by this user"
    })
    @Prop({ type: [MongooseSchema.Types.ObjectId], required: false })
        referredUserIds: Array<Types.ObjectId>

    @Field(() => Boolean, {
        description: "Whether the user has been awarded for following on X/Twitter"
    })
    @Prop({ type: Boolean, default: false })
        followXAwarded: boolean

    @Field(() => Boolean, {
        description: "Whether the current user is followed by the requesting user",
        nullable: true
    })
        followed?: boolean

    @Field(() => Float, {
        description: "Volume level for sound effects (range: 0.0 to 1.0)"
    })
    @Prop({ type: Number, default: 0.5 })
        sound: number

    @Field(() => Float, {
        description: "Volume level for ambient sounds (range: 0.0 to 1.0)"
    })
    @Prop({ type: Number, default: 0.5 })
        ambient: number

    @Field(() => String, {
        description: "The string to determine the",
        nullable: true
    })
    @Prop({ type: String, required: false })
        nftBoxVector?: string

    // last online time
    @Field(() => Date, {
        nullable: true,
        description: "The last time the user was online"
    })
    @Prop({ type: Date, required: false })
        lastOnlineTime?: Date

    // is online
    @Field(() => Boolean, {
        description: "Whether the user is online"
    })
    @Prop({ type: Boolean, default: false })
        isOnline: boolean

    // selected dog id
    @Field(() => ID, {
        nullable: true,
        description: "The ID of the selected dog"
    })
    @Prop({ type: MongooseSchema.Types.ObjectId, required: false })
        selectedPlacedItemDogId?: Types.ObjectId

    // selected cat id
    @Field(() => ID, {
        nullable: true,
        description: "The ID of the selected cat"
    })
    @Prop({ type: MongooseSchema.Types.ObjectId, required: false })
        selectedPlacedItemCatId?: Types.ObjectId

    @Field(() => String, {
        description: "The email of the user",
        nullable: true
    })
    @Prop({ type: String, required: false })
        email?: string

    @Field(() => String, {
        description: "The oauth provider of the user",
        nullable: true
    })
    @Prop({ type: String, required: false })
        oauthProvider?: OauthProviderName

    @Field(() => String, {
        description: "The oauth provider id of the user",
        nullable: true
    })
    @Prop({ type: String, required: false })
        oauthProviderId?: string

    @Field(() => Float, {
        description: "The tCIFARM balance of the user",
        defaultValue: 0
    })
    @Prop({ type: Number, default: 0 })
        tCIFARM: number

    @Field(() => [ID], {
        description: "The IDs of users that the user is following",
        defaultValue: []
    })
    @Prop({ type: [MongooseSchema.Types.ObjectId], required: false })
        followeeUserIds: Array<Types.ObjectId>

    @Field(() => TutorialSchema, {
        nullable: true
    })
    @Prop({
        type: TutorialSchemaClass,
        nullable: true
    })
        tutorial?: TutorialSchema

    @Field(() => Int, {
        description: "The index of the land limit the user has",
        defaultValue: 0
    })
    @Prop({ type: Number, default: 0 })
        landLimitIndex: number

    // fairy is a machenic that allow everything in game grow without take care
    @Field(() => Date, {
        description: "The duration of the fairy",
        defaultValue: null
    })
    @Prop({ type: Date, required: false })
        fairyDuration?: Date
}

export const UserSchemaClass = SchemaFactory.createForClass(UserSchema)

UserSchemaClass.index({
    energyFull: 1,
    createdAt: -1,
})