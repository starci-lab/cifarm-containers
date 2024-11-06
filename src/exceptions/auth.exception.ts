import { HttpException, HttpStatus } from "@nestjs/common"

export class AccountNotFoundException extends HttpException {
    constructor() {
        super("Account not found", HttpStatus.NOT_FOUND)
    }
}

export class NotHavePermissionException extends HttpException {
    constructor(userRoles: Array<string>, requiredRoles: Array<string>) {
        super(
            `You do not have permission. User roles: ${userRoles.join(", ")}, required roles: ${requiredRoles.join(", ")}`,
            HttpStatus.FORBIDDEN,
        )
    }
}

export class UsernameAlreadyExistsException extends HttpException {
    constructor(username: string) {
        super(`Username already exists: ${username}`, HttpStatus.CONFLICT)
    }
}
