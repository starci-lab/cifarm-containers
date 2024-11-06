import { Field, ObjectType } from "@nestjs/graphql"
import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
} from "typeorm"
import { AbstractEntity } from "./abstract"
import { UserEntity } from "./user.entity"

@ObjectType()
@Entity("inventories")
export class InventoryEntity extends AbstractEntity {
  @Field(() => String)
  @Column({ name: "quantity", type: "int", default: 1 })
      quantity: string

  @Field(() => String)
  @Column({ name: "user_id", type: "uuid" })
      userId: string

  @Field(() => UserEntity)
  @ManyToOne(() => UserEntity, (user) => user.inventories)
  @JoinColumn({ name: "user_id" })
      user: UserEntity
}