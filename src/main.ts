import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { watch } from "node:fs/promises";
import { ParsedPath, dirname, parse, relative, resolve } from "node:path";
import { exit } from "node:process";
import { load as LoadYaml } from "js-yaml";
import { DOMImplementation, XMLSerializer } from "@xmldom/xmldom";
import { error } from "./Error";
import { GetDirListing, IsDirectory, IsYamlFile, Rename } from "./Utils";

function CreateChildren( doc: XMLDocument, data: any ): HTMLUnknownElement
{
	const children: HTMLUnknownElement = doc.createElement( "children" );

	for( let i = 0; i < data.length; i++ )
	{
		const layer = CreateLayer( doc, data[i] );
		children.appendChild( layer );
	}
	return children;
}

function CreateLayer( doc: XMLDocument, data: any, name: string = "Layer" ): HTMLUnknownElement
{
	const element: HTMLUnknownElement = doc.createElement( name );

	for( const property in data )
	{
		if( property !== "children" )
		{
			element.setAttribute( property, data[property] );
		}
		else
		{
			const children = CreateChildren( doc, data[property] );
			element.appendChild( children );
		}
	}
	return element;
}

function YamlToXml( data: any ): string
{
	const XML: XMLSerializer = new XMLSerializer();
	const doc: XMLDocument = new DOMImplementation().createDocument( null, null, null );
	const element: HTMLUnknownElement = CreateLayer( doc, data, "ActorFrame" );

	doc.appendChild( element );

	return XML.serializeToString( doc );
}

export function Load( filepath: string ): string
{
	if( !existsSync(filepath) )
	{
		error( `"${filepath}" is not found.` );
		exit( 1 );
	}
	const data: string = readFileSync( filepath, "utf8" );
	const obj: any = LoadYaml( data );
	const xml: string = YamlToXml( obj );
	return xml;
}

export function Write( fromPath: string, toPath: string = fromPath ): void
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

export async function Watcher( fromPath: string, toPath: string = fromPath ): Promise<void>
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
