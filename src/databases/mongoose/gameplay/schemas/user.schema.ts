import { Field, Float, Int, ObjectType } from "@nestjs/graphql"
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { AbstractSchema } from "./abstract"
import { ChainKey, Network } from "@src/env"
import { TutorialStep } from "../enums"

@ObjectType()
@Schema({
    timestamps: true,
    collection: "users"
})
export class UserSchema extends AbstractSchema {
    @Field(() => String)
    @Prop({ type: String, required: true, unique: true, length: 100 })
        username: string

    @Field(() => String)
    @Prop({
        type: String,
        required: true,
        enum: ChainKey,
        default: ChainKey.Solana
    })
        chainKey: ChainKey

    @Field(() => String)
    @Prop({
        type: String,
        required: true,
        enum: Network,
        default: Network.Testnet
    })
        network: Network

    @Field(() => String)
    @Prop({ type: String, length: 100 })
        accountAddress: string

    @Field(() => Int)
    @Prop({ type: Number, default: 0 })
        golds: number

    @Field(() => String, { nullable: true })
    @Prop({ type: String, required: false })
        avatarUrl?: string

    @Field(() => Float)
    @Prop({ type: Number, default: 0 })
        tokens: number

    @Field(() => Int)
    @Prop({ type: Number, default: 0 })
        experiences: number

    @Field(() => Int)
    @Prop({ type: Number, default: 0 })
        energy: number

    @Field(() => Float)
    @Prop({ type: Number, default: 0 })
        energyRegenTime: number

    @Field(() => Boolean)
    @Prop({ type: Boolean, default: false })
        energyFull: boolean

    @Field(() => Int)
    @Prop({ type: Number, default: 1 })
        level: number

    // tutorial step
    @Field(() => Int)
    @Prop({ type: Number, default: 0 })
        tutorialStep: TutorialStep

    @Field(() => Int)
    @Prop({ type: Number, default: 0 })
        dailyRewardStreak: number

    @Field(() => Date, { nullable: true })
    @Prop({ type: Date, nullable: true })
        dailyRewardLastClaimTime?: Date

    @Field(() => Date, { nullable: true })
    @Prop({ type: Date, nullable: true })
        spinLastTime?: Date

    @Field(() => Int)
    @Prop({ type: Number, default: 0 })
        spinCount: number

    // graphql field
    @Field(() => Boolean)
        followed?: boolean
}

export const UserSchemaClass = SchemaFactory.createForClass(UserSchema)
