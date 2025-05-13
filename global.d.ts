// global.d.ts
import "express-session"

declare module "express-session" {
    interface SessionData {
        oauthState?: string
    }
}