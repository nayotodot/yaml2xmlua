#!/usr/bin/env node
import console from "node:console";
import process from "node:process";
import { Watcher, Write } from "./main";
import { PACKAGE_NAME, PACKAGE_VERSION } from "./Package";
import { ResolveAbsolutePath } from "./Utils";

const HELP_TEXT: string = `
usage: ${PACKAGE_NAME} [options]

options:
    -i, --input      <input file or directory path>
    -o, --output     <output file or directory path>
    -h, --help       this helptext.
    -v, --version    show version.
`;

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
