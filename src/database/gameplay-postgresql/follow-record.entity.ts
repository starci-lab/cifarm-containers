import { Field, ObjectType } from "@nestjs/graphql"
import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm"
import { UserEntity } from "@src/database"

@ObjectType()
@Entity("follow_records")
export class FollowRecordEntity {
    @Field(() => String, { nullable: false })
    @PrimaryColumn({ name: "follower_id", type: "uuid" })
        followerId: string

    @Field(() => String, { nullable: false })
    @PrimaryColumn({ name: "followee_id", type: "uuid" })
        followeeId: string

    @Field(() => UserEntity, { nullable: false })
    @ManyToOne(() => UserEntity, (user) => user.followingRecords)
    @JoinColumn({ name: "follower_id" })
        follower: UserEntity

    @Field(() => UserEntity, { nullable: false })
    @ManyToOne(() => UserEntity, (user) => user.followedRecords)
    @JoinColumn({ name: "followee_id" })
        followee: UserEntity
}
