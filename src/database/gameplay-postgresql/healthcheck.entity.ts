import { Field, ObjectType } from "@nestjs/graphql"
import { Column, Entity } from "typeorm"
import { UuidAbstractEntity } from "./abstract"

@ObjectType()
@Entity("healthcheck")
export class HealthcheckEntity extends UuidAbstractEntity {
    @Field(() => String, { nullable: true })
    @Column({ name: "message", nullable: true })
        message: string
}