export const property = {
    get: (obj: any, path: string, sep = '.') => {
        return path.split(sep).reduce((o, i) => o && o[i], obj);
    }
}