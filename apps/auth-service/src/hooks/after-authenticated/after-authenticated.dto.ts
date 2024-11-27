import { Empty, UserIdRequest } from "@src/types"

export class AfterAuthenticatedRequest extends UserIdRequest {}

export type AfterAuthenticatedResponse = Empty
