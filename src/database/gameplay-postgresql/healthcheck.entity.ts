import { ObjectType } from "@nestjs/graphql"
import {
    Entity,
} from "typeorm"
import { AbstractEntity } from "./abstract"

@ObjectType()
@Entity("healthcheck")
export class HealthcheckEntity extends AbstractEntity {
}