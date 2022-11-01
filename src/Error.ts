class AssertError extends Error
{
	constructor( msg?: string )
	{
		super( msg );
		this.name = "Assert";
	}
}

export function assert( assertion: any, msg?: string ): asserts assertion
{
	if( !assertion )
	{
		throw new AssertError( msg );
	}
}

export function error( msg: string ): void
{
	throw new Error( msg );
}
