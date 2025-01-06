import { Field, Int, ObjectType } from "@nestjs/graphql"
import { CacheControl } from "@src/decorators"
import { Column, Entity } from "typeorm"
import { AvailableInType } from "../enums"
import { StringAbstractEntity } from "./abstract"

@CacheControl({ maxAge: 100 })
@ObjectType()
@Entity("tools")
export class ToolEntity extends StringAbstractEntity {
    @Field(() => String)
    @CacheControl({ maxAge: 100 })
    @Column({ name: "available_in", type: "enum", enum: AvailableInType })
        availableIn: AvailableInType
    
    @Field(() => Int)
    @CacheControl({ maxAge: 100 })
    @Column({ name: "index", type: "int" })
        index: number
}
