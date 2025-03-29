export const createFirstCharLowerCaseEnumType = (
    enumType: object
): Record<string, string | number> => {
    const lowerCaseEnumType = {}
    for (const key in enumType) {
        // lower the first letter of the key
        const lowerCaseKey = key.charAt(0).toLowerCase() + key.slice(1)
        lowerCaseEnumType[lowerCaseKey] = enumType[key]
    }
    return lowerCaseEnumType
}
