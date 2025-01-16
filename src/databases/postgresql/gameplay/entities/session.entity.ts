import { Field, ObjectType } from "@nestjs/graphql"
import { Column, Entity, Index, JoinColumn, ManyToOne, UpdateDateColumn } from "typeorm"
import { UuidAbstractEntity } from "./abstract"
import { UserEntity } from "./user.entity"

@ObjectType()
@Entity("sessions")
export class SessionEntity extends UuidAbstractEntity {
    @Field(() => String)
    @Column({ name: "refresh_token", type: "varchar", length: 255, unique: true })
        refreshToken: string

    @Field(() => Date)
    @UpdateDateColumn({ type: "timestamptz", name: "expired_at" })
        expiredAt: Date

    @Index("idx_user_id") // Index
    @Field(() => String, { nullable: true })
    @Column({ name: "user_id", nullable: true })
        userId: string

    @Field(() => Boolean, { defaultValue: true })
    @Column({ name: "is_active", type: "boolean", default: true })
        isActive: boolean

    @Field(() => String, { nullable: true })
    @Column({ name: "device", type: "varchar", length: 100, nullable: true })
        device?: string

    @Field(() => String, { nullable: true })
    @Column({ name: "os", type: "varchar", length: 100, nullable: true })
        os?: string

    @Field(() => String, { nullable: true })
    @Column({ name: "browser", type: "varchar", length: 100, nullable: true })
        browser?: string

    @Field(() => String, { nullable: true })
    @Column({ name: "ip_v4", type: "varchar", length: 50, nullable: true })
        ipV4?: string

    @Field(() => UserEntity, { nullable: true })
    @ManyToOne(() => UserEntity, (user) => user.sessions, { onDelete: "CASCADE" })
    @JoinColumn({ name: "user_id", referencedColumnName: "id" })
        user?: UserEntity
}
