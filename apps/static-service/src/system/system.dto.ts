import { SystemEntity } from "@src/database"

export class GetSystemRequest {
    id: string
}

export class GetSystemResponse extends SystemEntity {}
