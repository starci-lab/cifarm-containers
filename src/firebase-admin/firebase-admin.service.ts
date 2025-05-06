import { Injectable, Logger } from "@nestjs/common"
import { envConfig } from "@src/env"
import { App, cert, initializeApp } from "firebase-admin/app"
import { Auth, getAuth } from "firebase-admin/auth"


@Injectable()
export class FirebaseAdminService {
    private readonly logger = new Logger(FirebaseAdminService.name)

    private readonly app: App   
    private readonly auth: Auth

    constructor() {
        const credential = envConfig().firebase.credential
        this.app = initializeApp({
            credential: cert({
                clientEmail: credential.clientEmail,
                privateKey: credential.privateKey,
                projectId: credential.projectId
            })
        })
        this.auth = getAuth(this.app)
    }

    public validateToken(token: string) {
        return this.auth.verifyIdToken(token)
    }

    public async getUser(uid: string) {
        return await this.auth.getUser(uid)
    }
}