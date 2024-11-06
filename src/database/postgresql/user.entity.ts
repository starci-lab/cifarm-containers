import { Field, ObjectType } from "@nestjs/graphql"
import { Column, Entity } from "typeorm"
import { AbstractEntity } from "./abstract"
import { SupportedChainKey } from "@src/config"
import { Network } from "@src/config"

@ObjectType()
@Entity("users")
export class UserEntity extends AbstractEntity {
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
  @Column({ name: "accountAddress", type: "varchar", length: 50 })
      accountAddress: string
}
