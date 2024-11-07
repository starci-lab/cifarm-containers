import { Field, Int, ObjectType } from "@nestjs/graphql";
import { Column, Entity } from "typeorm";
import { AbstractEntity } from "./abstract";
import { AvailableIn, ToolType } from "./enums";

@ObjectType()
@Entity("tools")
export class ToolEntity extends AbstractEntity {
    @Field(() => ToolType)
    @Column({ name: "type", type: "enum", enum: ToolType })
        type: ToolType
    
    @Field(() => AvailableIn)
    @Column({ name: "available_in", type: "enum", enum: AvailableIn })
        availableIn: AvailableIn;
    
    @Field(() => Int)
    @Column({ name: "index", type: "int" })
        index: number;
}
