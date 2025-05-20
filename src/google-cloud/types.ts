import { Network } from "@src/env"

export type UserGoogleLike = {
    email: string
    username: string
    picture: string
    id: string
    network: Network
    referralUserId?: string
}


