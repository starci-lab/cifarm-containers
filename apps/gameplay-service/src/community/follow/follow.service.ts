import { Injectable, Logger } from "@nestjs/common"
import { InjectMongoose, 
// UserSchema 
} from "@src/databases"
// import { FollowRequest } from "./follow.dto"
// import { GrpcInvalidArgumentException, GrpcNotFoundException } from "nestjs-grpc-exceptions"
// import { GrpcFailedPreconditionException } from "@src/common"
import { Connection } from "mongoose"
import { FollowRequest } from "./follow.dto"

@Injectable()
export class FollowService {
    private readonly logger = new Logger(FollowService.name)

    
    constructor(
        @InjectMongoose()
        private readonly connection: Connection
    ) {
    }

    async follow(
        request: FollowRequest
    ) {
        console.log(request)
        // if (request.userId === request.followeeUserId) {
        //     throw new GrpcInvalidArgumentException("Cannot follow self")
        // }

        // const queryRunner = this.dataSource.createQueryRunner()
        // await queryRunner.connect()

        // try {  
        //     const followeeUserExists = await queryRunner.manager.exists(UserSchema, {
        //         where: {
        //             id: request.followeeUserId
        //         }
        //     })
        //     if (!followeeUserExists) {
        //         throw new GrpcNotFoundException("Followee user not found")
        //     }

        //     const followed = await queryRunner.manager.findOne(UsersFollowingUsersEntity, {
        //         where: {
        //             followerId: request.userId,
        //             followeeUserId: request.followeeUserId
        //         }
        //     })
        //     if (followed) {
        //         throw new GrpcFailedPreconditionException("Already followed")
        //     }
        //     await queryRunner.startTransaction()
        //     try {
        //         await queryRunner.manager.save(UsersFollowingUsersEntity, {
        //             followerId: request.userId,
        //             followeeUserId: request.followeeUserId
        //         })
        //         await queryRunner.commitTransaction()
        //     } catch (error) {
        //         const errorMessage = `Transaction failed, reason: ${error.message}`
        //         this.logger.error(errorMessage)
        //         await queryRunner.rollbackTransaction()
        //         throw new GrpcNotFoundException(errorMessage)
        //     }
        //     return {} 
        // }
        // finally {
        //     await queryRunner.release()
        // } 
        return {}
    }
}