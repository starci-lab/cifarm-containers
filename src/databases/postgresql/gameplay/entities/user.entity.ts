import { Field, Float, Int, ObjectType } from "@nestjs/graphql"
import { Network, ChainKey } from "@src/env"
import { Column, Entity, OneToMany } from "typeorm"
import { UuidAbstractEntity } from "./abstract"
import { InventoryEntity } from "./inventory.entity"
import { PlacedItemEntity } from "./placed-item.entity"
import { DeliveringProductEntity } from "./delivering-product.entity"
import { UsersFollowingUsersEntity } from "./users-following-users.entity"
import { SessionEntity } from "./session.entity"

@ObjectType()
@Entity("users")
export class UserEntity extends UuidAbstractEntity {
    @Field(() => String)
    @Column({ name: "username", type: "varchar", length: 50 })
        username: string

    @Field(() => String)
    @Column({ name: "chainKey", type: "varchar", length: 50 })
        chainKey: ChainKey

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

    @Field(() => Float)
    @Column({ type: "float", default: 0 })
        energyRegenTime: number

    @Field(() => Boolean)
    @Column({ name: "energy_full", type: "boolean", default: true })
        energyFull: boolean

    @Field(() => Int)
    @Column({ name: "level", type: "int", default: 1 })
        level: number

    // tutorial step
    @Field(() => Int)
    @Column({ name: "tutorial_step", type: "int", default: 0 })
        tutorialStep: number

    // tutorial ended
    @Field(() => Boolean)
    @Column({ name: "tutorial_ended", type: "boolean", default: false })
        tutorialEnded: number

    @Field(() => Int)
    @Column({ name: "daily_reward_streak", type: "int", default: 0 })
        dailyRewardStreak: number

    @Field(() => Date, { nullable: true })
    @Column({ name: "daily_reward_last_claim_time", type: "timestamp without time zone", nullable: true })
        dailyRewardLastClaimTime?: Date

    @Field(() => Int)
    @Column({ name: "daily_reward_number_of_claim", type: "int", default: 0 })
        dailyRewardNumberOfClaim: number

    @Field(() => Date, { nullable: true })
    @Column({ name: "spin_last_time", type: "timestamp without time zone", nullable: true })
        spinLastTime?: Date

    @Field(() => Int)
    @Column({ name: "spin_count", type: "int", default: 0 })
        spinCount: number
        
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
    @OneToMany(() => UsersFollowingUsersEntity, (userFollowing) => userFollowing.followeeUserId, {
        cascade: true,
        onDelete: "CASCADE"
    })
        followingUsers: Array<UsersFollowingUsersEntity>

    @Field(() => [UserEntity])
    @OneToMany(() => UsersFollowingUsersEntity, (userFollowing) => userFollowing.followerId, {
        cascade: true,
        onDelete: "CASCADE"
    })
        followedByUsers: Array<UsersFollowingUsersEntity>

    @Field(() => [SessionEntity])
    @OneToMany(() => SessionEntity, (session) => session.user, {
        cascade: true,
        onDelete: "CASCADE"
    })
        sessions?: Array<SessionEntity>
}
