import {
    registerDecorator,
    ValidationOptions,
} from "class-validator"
  
export const IsGoogleOauthToken = (validationOptions?: ValidationOptions) => {
    return function (object: object, propertyName: string) {
        registerDecorator({
            name: "isGoogleOauthToken",
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value: string) {
                    if (typeof value !== "string") return false
  
                    // Hoặc Access Token bắt đầu bằng ya29.
                    const isAccessToken = value.startsWith("ya29.")
  
                    return isAccessToken
                },
                defaultMessage(): string {
                    return "Invalid google oauth token"
                },
            },
        })
    }
}