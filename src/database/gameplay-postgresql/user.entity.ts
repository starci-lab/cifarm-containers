import { Field, Float, ID, Int, ObjectType } from "@nestjs/graphql"
import { Network, SupportedChainKey } from "@src/config"
import { Column, Entity, JoinColumn, OneToMany, OneToOne } from "typeorm"
import { UuidAbstractEntity } from "./abstract"
import { InventoryEntity } from "./inventory.entity"
import { PlacedItemEntity } from "./placed-item.entity"
import { DeliveringProductEntity } from "./delivering-product.entity"
import { FollowRecordEntity } from "./follow-record.entity"

@ObjectType()
@Entity("users")
export class UserEntity extends UuidAbstractEntity {
    @Field(() => String)
    @Column({ name: "username", type: "varchar", length: 50 })
        username: string

    @Field(() => String)
    @Column({ name: "chainKey", type: "varchar", length: 50 })
        chainKey: SupportedChainKey

    @Field(() => String)
    @Column({ name: "network", type: "varchar", length: 50 })
        network: Network

    @Field(() => String)
    @Column({ name: "account_address", type: "varchar", length: 100 })
        accountAddress: string

    @Field(() => Int)
    @Column({ name: "golds", type: "int4", default: 0 })
        golds: number

    @Field(() => Float)
    @Column({ name: "tokens", type: "float", default: 0 })
        tokens: number

    @Field(() => Int)
    @Column({ name: "experiences", type: "int", default: 0 })
        experiences: number

    @Field(() => Int)
    @Column({ name: "energy", type: "int", default: 0 })
        energy: number

    @Field(() => Int)
    @Column({ name: "level", type: "int", default: 1 })
        level: number

    @Field(() => Int)
    @Column({ name: "tutorial_index", type: "int", default: 0 })
        tutorialIndex: number

    @Field(() => Int)
    @Column({ name: "step_index", type: "int", default: 0 })
        stepIndex: number

    @Field(() => Int)
    @Column({ name: "daily_reward_streak", type: "int", default: 0 })
        dailyRewardStreak: number

    @Field(() => Date)
    @Column({ name: "daily_reward_last_claim_time", type: "timestamp without time zone", nullable: true })
        dailyRewardLastClaimTime?: Date

    @Field(() => Int)
    @Column({ name: "daily_reward_number_of_claim", type: "int", default: 0 })
        dailyRewardNumberOfClaim: number

    @Field(() => Date)
    @Column({ name: "spin_last_time", type: "timestamp without time zone", nullable: true })
        spinLastTime?: Date

    @Field(() => Int)
    @Column({ name: "spin_count", type: "int", default: 0 })
        spinCount: number

    @Field(() => ID, { nullable: true })
    @Column({ name: "visiting_user_id", type: "uuid", nullable: true })
        visitingUserId?: string

    @Field({ nullable: true })
    @Column({ name: "is_random", type: "boolean", nullable: true })
        isRandom?: boolean

    @Field(() => UserEntity, { nullable: true })
    @OneToOne(() => UserEntity, { nullable: true })
    @JoinColumn({ name: "visiting_user_id" })
        visitingUser?: UserEntity

    @Field(() => [InventoryEntity])
    @OneToMany(() => InventoryEntity, (inventory) => inventory.user, {
        cascade: true,
        onDelete: "CASCADE"
    })
        inventories?: Array<InventoryEntity>

    @Field(() => [PlacedItemEntity])
    @OneToMany(() => PlacedItemEntity, (placedItem) => placedItem.user, {
        cascade: true,
        onDelete: "CASCADE"
    })
        placedItems?: Array<PlacedItemEntity>

    @Field(() => [DeliveringProductEntity])
    @OneToMany(() => DeliveringProductEntity, (deliveringProduct) => deliveringProduct.user, {
        cascade: true,
        onDelete: "CASCADE"
    })
        deliveringProducts?: Array<DeliveringProductEntity>

    @Field(() => [UserEntity])
    @OneToMany(() => FollowRecordEntity, (userFollowing) => userFollowing.followeeId, {
        cascade: true,
        onDelete: "CASCADE"
    })
        followingRecords: Array<FollowRecordEntity>

    @Field(() => [UserEntity])
    @OneToMany(() => FollowRecordEntity, (userFollowing) => userFollowing.followerId, {
        cascade: true,
        onDelete: "CASCADE"
    })
        followedRecords: Array<FollowRecordEntity>
}
