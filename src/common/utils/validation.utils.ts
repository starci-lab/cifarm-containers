export const isGuid = (guid: string): boolean => {
    const guidPattern = /^[{]?[0-9a-fA-F]{8}(-[0-9a-fA-F]{4}){3}-[0-9a-fA-F]{12}[}]?$/
    return guidPattern.test(guid)
}
