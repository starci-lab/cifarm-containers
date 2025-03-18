export const createLowerCaseEnumType = (enumType: object) : Record<string, string | number> => {
    const lowerCaseEnumType = {}
    for (const key in enumType) {
        lowerCaseEnumType[key.toLowerCase()] = enumType[key]
    }
    return lowerCaseEnumType
}
