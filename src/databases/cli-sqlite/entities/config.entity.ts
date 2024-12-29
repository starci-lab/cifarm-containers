import { StringAbstractEntity } from "./abstract"
import { Column, Entity } from "typeorm"

@Entity("config")
export class ConfigEntity extends StringAbstractEntity {
    @Column({ type: "varchar", length: 255 })
        value: string
}