"use strict";
const main = require( "../dist/main.js" ).default;
const path = require( "node:path" );
const data = main( path.join(__dirname, "example.yaml") );
console.log( data );
