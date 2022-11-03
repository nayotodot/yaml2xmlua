#!/usr/bin/env node
import console from "node:console";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { watch } from "node:fs/promises";
import { dirname, format, parse, ParsedPath, relative, resolve } from "node:path";
import process from "node:process";
import { Load } from "./main";
import { PACKAGE_NAME, PACKAGE_VERSION } from "./Package";
import { GetDirListing, IsDirectory, IsYamlFile, ResolveAbsolutePath } from "./Utils";

const HELP_TEXT: string = `
usage: ${PACKAGE_NAME} [options]

options:
    -i, --input      <input file or directory path>
    -o, --output     <output file or directory path>
    -h, --help       this helptext.
    -v, --version    show version.
`;

function Rename( path: string ): string
{
	const fmt: ParsedPath = parse( path );
	fmt.ext = ".xml";
	fmt.base = "";
	return format( fmt );
}

function Write( fromPath: string, toPath: string = fromPath ): void
{
	if( IsDirectory(fromPath) && IsDirectory(toPath) )
	{
		const list: string[] = GetDirListing( fromPath );
		for( const source of list )
		{
			if( IsYamlFile(source) )
			{
				const data: string = Load( source );
				const path: string = resolve( toPath, relative(fromPath, Rename(source)) );
				if( !existsSync(dirname(path)) )
				{
					mkdirSync( dirname(path), { recursive: true } );
				}
				console.log( `"${source}" => "${path}"` );
				writeFileSync( path, data, "utf-8" );
			}
		}
	}
	else if( IsYamlFile(fromPath) )
	{
		if( IsDirectory(toPath) )
		{
			const fmt: ParsedPath = parse( fromPath );
			toPath = resolve( toPath, fmt.name + ".xml" );
		}
		const data: string = Load( fromPath );
		console.log( `"${fromPath}" => "${toPath}"` );
		writeFileSync( toPath, data, "utf-8" );
	}
}

async function Watcher( fromPath: string, toPath: string = fromPath ): Promise<void>
{
	const watcher = watch( fromPath, { recursive: true } );
	for await( const event of watcher )
	{
		const realpath: string = resolve( fromPath, event.filename );
		if( IsYamlFile(realpath) )
		{
			const date: Date = new Date();
			const outPath: string = resolve( toPath, Rename(event.filename) );
			console.log( "[%d:%d:%d] %s (%s)", date.getHours(), date.getMinutes(), date.getSeconds(), event.filename, event.eventType );
			Write( realpath, outPath );
		}
	}
}

export function main( argv: string[] = process.argv.slice(2) )
{
	let index: number = 0;
	let isWatchMode: boolean = false;
	const inputs: string[] = [];
	const outputs: string[] = [];

	if( !argv.length )
	{
		argv.push( "--help" );
	}

	while( argv[index] )
	{
		switch( argv[index] )
		{
		case "-h":
		case "--help":
			console.log( HELP_TEXT );
			process.exit( 1 );
			break;
		case "-v":
		case "--version":
			console.log( `${PACKAGE_NAME} (${PACKAGE_VERSION})` );
			process.exit( 1 );
			break;
		case "-i":
		case "--input":
			inputs.push( argv[++index] );
			break;
		case "-o":
		case "--output":
			outputs.push( argv[++index] );
			break;
		case "-w":
		case "-watch":
			isWatchMode = true;
			break;
		default:
			inputs.push( argv[index] );
			outputs.push( argv[index] );
			break;
		}
		index++;
	}

	if( !outputs.length )
	{
		outputs.push( process.cwd() );
	}

	for( let index: number = 0; index < inputs.length; index++ )
	{
		const fromPath: string = ResolveAbsolutePath( inputs[index] );
		const toPath: string = ResolveAbsolutePath( outputs[index] );
		Write( fromPath, toPath );
		if( isWatchMode )
		{
			Watcher( fromPath, toPath );
		}
	}
}

if( require.main === module )
{
	main();
}
