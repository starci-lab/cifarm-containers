import { Entity, Column } from "typeorm"
import { UuidAbstractEntity } from "./abstract"

@Entity("users")
export class UserEntity extends UuidAbstractEntity {
    @Column({ name: "username", type: "varchar", length: 50, nullable: false })
        username: string

    @Column({ name: "telegram_id", type: "varchar", length: 10, nullable: false, unique: true })
        telegramId: string
}
