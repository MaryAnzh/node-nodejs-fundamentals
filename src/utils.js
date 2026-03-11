import path from "path";

export const normalizePath = (pathname) => path.posix.join(...pathname.split(path.sep));

export const isFile = (item) => {
    const TYPE = Object.getOwnPropertySymbols(item)[0];
    return item[TYPE] === 1;
}