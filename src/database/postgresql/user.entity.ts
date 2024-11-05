import { Field, ObjectType } from "@nestjs/graphql"
import {
    Column,
    Entity,
} from "typeorm"
import { AbstractEntity } from "./abstract"

@ObjectType()
@Entity("users")
export class UsersEntity extends AbstractEntity {
  @Field(() => String)
  @Column({ name: "username", type: "varchar", length: 50 })
      username: string
}