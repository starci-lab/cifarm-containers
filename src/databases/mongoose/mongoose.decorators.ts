import { InjectConnection } from "@nestjs/mongoose"
import { getMongooseConnectionName } from "./utils"
import { MongooseOptions } from "./types"

export const InjectMongoose = (options: MongooseOptions = {}) => InjectConnection(getMongooseConnectionName(options))

export function MongooseTransaction() {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value

        descriptor.value = async function (...args: any[]) {
            const mongoSession = await this.connection.startSession()
            mongoSession.startTransaction()

            try {
                // Pass the session to the method's arguments
                const result = await originalMethod.apply(this, [...args, mongoSession])

                // If everything is successful, commit the transaction
                await mongoSession.commitTransaction()
                return result
            } catch (error) {
                // If there's any error, abort the transaction
                await mongoSession.abortTransaction()
                throw error // Re-throw the error after aborting the transaction
            } finally {
                // End the session after the operation is complete
                await mongoSession.endSession()
            }
        }

        return descriptor
    }
}