import { Injectable, Logger } from "@nestjs/common"
import { JwtService } from "@src/jwt"
import { RefreshRequest, RefreshResponse } from "./refresh.dto"
import { GrpcUnauthenticatedException } from "nestjs-grpc-exceptions"
import { DateUtcService } from "@src/date"
import { InjectMongoose, SessionSchema } from "@src/databases"
import { Connection } from "mongoose"

@Injectable()
export class RefreshService {
    private readonly logger = new Logger(RefreshService.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection,
        private readonly jwtService: JwtService,
        private readonly dateUtcService: DateUtcService
    ) {}

    public async refresh({
        refreshToken,
    }: RefreshRequest): Promise<RefreshResponse> {
        const mongoSession = await this.connection.startSession()     
        mongoSession.startTransaction()
        try {
            const session = await this.connection.model<SessionSchema>(SessionSchema.name).findOne({
                refreshToken
            }).session(mongoSession)
            if (!session) throw new GrpcUnauthenticatedException("Session not found")
            const { expiredAt } = session
            //if current time is after the expired time, throw error that refresh token is expired
            if (this.dateUtcService.getDayjs().isAfter(expiredAt))
                throw new GrpcUnauthenticatedException("Refresh token is expired")
            const {
                accessToken,
                refreshToken: { token: newRefreshToken, expiredAt: newExpiredAt }
            } = await this.jwtService.generateAuthCredentials({
                id: session.user.toString(),
            })

            //create new session with new refresh token and expired time
            await this.connection.model<SessionSchema>(SessionSchema.name).create(
                [{
                    user: session.user,
                    refreshToken: newRefreshToken,
                    expiredAt: newExpiredAt
                }],
                { session: mongoSession }
            )

            await mongoSession.commitTransaction()
            
            return {
                accessToken,
                refreshToken: newRefreshToken
            }
        } catch (error) {
            this.logger.error(error)
            await mongoSession.abortTransaction()
            throw error
        } finally {
            await mongoSession.endSession()
        }
    } 
}
