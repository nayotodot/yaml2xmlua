import { DOMImplementation, XMLSerializer } from "@xmldom/xmldom";
import * as yaml from "js-yaml";
import * as fs from "node:fs";
import * as path from "node:path";

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

export default function Load( filepath: string ): string
{
	if( !fs.existsSync(filepath) )
	{
		console.error( `"${filepath}" is not found.` );
		process.exit( 0 );
	}
	const data: string = fs.readFileSync( filepath, "utf8" );
	const obj: any = yaml.load( data );
	const xml: string = YamlToXml( obj );
	return xml;
}
