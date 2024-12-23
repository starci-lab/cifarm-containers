import { Field, ObjectType } from "@nestjs/graphql"
import { Column, Entity, Index, JoinColumn, ManyToOne, UpdateDateColumn } from "typeorm"
import { UuidAbstractEntity } from "./abstract"
import { UserEntity } from "./user.entity"

@ObjectType()
@Entity("user_sessions")
export class SessionEntity extends UuidAbstractEntity {
  @Field(() => String)
  @Column({ name: "token", type: "varchar", length: 255, unique: true })
      token: string

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
  @Column({ name: "device_info", type: "varchar", length: 100, nullable: true })
      deviceInfo?: string

  @Field(() => UserEntity, { nullable: true })
  @ManyToOne(() => UserEntity, (user) => user.sessions, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id", referencedColumnName: "id" })
      user?: UserEntity
}
