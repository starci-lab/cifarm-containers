import { Field, ObjectType } from "@nestjs/graphql"
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm"
import { UuidAbstractEntity } from "./abstract"
import { UserEntity } from "./user.entity"

@ObjectType()
@Entity("users_following_users")
export class UsersFollowingUsersEntity extends UuidAbstractEntity {
    @Field(() => String, { nullable: false })
    @Column({ name: "follower_id", type: "uuid" })
        followerId: string

    @Field(() => String, { nullable: false })
    @Column({ name: "followee_id", type: "uuid" })
        followeeId: string

    @Field(() => UserEntity, { nullable: false })
    @ManyToOne(() => UserEntity, (user) => user.followingUsers)
    @JoinColumn({ name: "follower_id" })
        follower: UserEntity

    @Field(() => UserEntity, { nullable: false })
    @ManyToOne(() => UserEntity, (user) => user.followedByUsers)
    @JoinColumn({ name: "followee_id" })
        followee: UserEntity
}
