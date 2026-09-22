export function numberToSpanishWords( n: number ): string {
	if ( n === 0 ) {
		return 'cero';
	}

	const units: string[] = [ '', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve' ];
	const teens: string[] = [ 'diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve' ];
	const twenties: string[] = [ 'veinte', 'veintiuno', 'veintidós', 'veintitrés', 'veinticuatro', 'veinticinco', 'veintiséis', 'veintisiete', 'veintiocho', 'veintinueve' ];
	const tens: string[] = [ '', '', '', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa' ];
	const hundreds: string[] = [ '', 'ciento', 'doscientos', 'trescientos', 'cuatrocientos', 'quinientos', 'seiscientos', 'setecientos', 'ochocientos', 'novecientos' ];

	if ( n < 10 ) {
		return units[ n ];
	}

	if ( n < 20 ) {
		return teens[ n - 10 ];
	}

	if ( n < 30 ) {
		return twenties[ n - 20 ];
	}

	if ( n < 100 ) {
		const t: number = Math.floor( n / 10 );
		const u: number = n % 10;
		return u === 0 ? tens[ t ] : `${ tens[ t ] } y ${ units[ u ] }`;
	}

	if ( n === 100 ) {
		return 'cien';
	}

	if ( n < 1000 ) {
		const h: number = Math.floor( n / 100 );
		const r: number = n % 100;
		return r > 0 ? `${ hundreds[ h ] } ${ numberToSpanishWords( r ) }` : hundreds[ h ];
	}

	if ( n < 10000 ) {
		const th: number = Math.floor( n / 1000 );
		const r: number = n % 1000;
		const thPrefix: string = th === 1 ? 'mil' : `${ numberToSpanishWords( th ) } mil`;
		return r > 0 ? `${ thPrefix } ${ numberToSpanishWords( r ) }` : thPrefix;
	}

	return String( n );
}
