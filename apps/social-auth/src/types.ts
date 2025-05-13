import { UserGoogleLike } from "@src/google-cloud"
import { UserFacebookLike } from "@src/facebook"
import { UserXLike } from "@src/x-api"

export type UserSocialLike = UserGoogleLike | UserFacebookLike | UserXLike