import { cwd } from "process";
import { Dirent, Stats, existsSync, readdirSync, statSync } from "node:fs";
import { ParsedPath, dirname, extname, format, isAbsolute, parse, resolve } from "node:path";
import { assert } from "./Error";

export function FileExists( path: string ): boolean
{
	assert( existsSync(path), `"${path}" does not exist.` );
	return true;
}

export function IsDirectory( path: string ): boolean
{
	if( !existsSync(path) )
	{
		return false;
	}
	const stats: Stats = statSync( path );
	return stats.isDirectory();
}

export function IsFile( path: string ): boolean
{
	if( !existsSync(path) )
	{
		return false;
	}
	const stats: Stats = statSync( path );
	return stats.isFile();
}

export function IsYamlFile( path: string ): boolean
{
	const ext: string = extname( path );
	return IsFile(path) && (ext === ".yaml" || ext === ".yml");
}

export function GetDirListing( dir: string ): string[]
{
	const files: string[] = [];
	const dirents: Dirent[] = readdirSync( dir, { withFileTypes: true } );

	for( const dirent of dirents )
	{
		const path: string = resolve( dir, dirent.name );

		if( dirent.isDirectory() )
		{
			files.push( ...GetDirListing(path) );
		}
		else if( dirent.isFile() )
		{
			files.push( path );
		}
	}

	return files;
}

export function GetDirName( path: string ): string
{
	return IsDirectory(path) ? path : dirname(path);
}

export function ResolveAbsolutePath( path: string ): string
{
	if( !isAbsolute(path) )
	{
		path = resolve( cwd(), path );
	}
	return path;
}

export function Rename( path: string ): string
{
	const fmt: ParsedPath = parse( path );
	fmt.ext = ".xml";
	fmt.base = "";
	return format( fmt );
}
