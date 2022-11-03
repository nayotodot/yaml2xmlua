const pkg: any = require( "../package.json" );
export const PACKAGE_NAME: string = pkg.name || "UNKNOWN";
export const PACKAGE_VERSION: string = pkg.version || "UNKNOWN";
