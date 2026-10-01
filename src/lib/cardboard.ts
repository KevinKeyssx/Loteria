import type { ICardboard } from '../types/cardboard';


interface IColumnRange {
	colStart	: number;
	colEnd		: number;
}


function createPrng( seedStr: string ): () => number {
	let h: number = 1779033703 ^ seedStr.length;

	for ( let i: number = 0; i < seedStr.length; i++ ) {
		h = Math.imul( h ^ seedStr.charCodeAt( i ), 3432918353 );
		h = ( h << 13 ) | ( h >>> 19 );
	}

	return (): number => {
		h = Math.imul( h ^ ( h >>> 16 ), 2246822507 );
		h = Math.imul( h ^ ( h >>> 13 ), 3266489909 );

        return ( ( h ^= h >>> 16 ) >>> 0 ) / 4294967296;
	};
}


function shuffle<T>( array: T[], rng: () => number ): T[] {
	const arr: T[] = [ ...array ];

	for ( let i: number = arr.length - 1; i > 0; i-- ) {
		const j: number = Math.floor( rng() * ( i + 1 ) );
		const temp: T = arr[ i ];
		arr[ i ] = arr[ j ];
		arr[ j ] = temp;
	}

	return arr;
}


export function generateCardboard(
	gameId	: string,
	cardId	: number,
	start	: number = 1,
	end		: number = 90
): ICardboard {
	const rng           : () => number      = createPrng( `${ gameId }-${ cardId }` );
	const totalNumbers  : number            = Math.max( 90, end - start + 1 );
	const colRanges     : IColumnRange[]    = [];

	for ( let col: number = 0; col < 9; col++ ) {
		const colStart: number = start + Math.floor( ( col * totalNumbers ) / 9 );

        let colEnd: number = start + Math.floor( ( ( col + 1 ) * totalNumbers ) / 9 ) - 1;

		if ( col === 8 ) {
			colEnd = end;
		}

		colRanges.push({
			colStart,
			colEnd
		});
	}

	let pattern: boolean[][] | null = null;

	for ( let attempt: number = 0; attempt < 500; attempt++ ) {
		const grid: boolean[][] = [
			new Array( 9 ).fill( false ),
			new Array( 9 ).fill( false ),
			new Array( 9 ).fill( false )
		];

		for ( let col: number = 0; col < 9; col++ ) {
			const r: number = Math.floor( rng() * 3 );

            grid[ r ][ col ] = true;
		}

		const rCounts: number[] = [
			grid[ 0 ].filter( Boolean ).length,
			grid[ 1 ].filter( Boolean ).length,
			grid[ 2 ].filter( Boolean ).length
		];

		if ( rCounts.some( ( c: number ): boolean => c > 5 ) ) {
			continue;
		}

		let needed: number = 15 - 9;

        const colOrder: number[] = shuffle( [ 0, 1, 2, 3, 4, 5, 6, 7, 8 ], rng );

		for ( const col of colOrder ) {
			if ( needed === 0 ) {
				break;
			}

			const availableRows: number[] = [ 0, 1, 2 ]
				.filter( ( r: number ): boolean => !grid[ r ][ col ] && rCounts[ r ] < 5 )
				.sort( ( a: number, b: number ): number => ( 5 - rCounts[ b ] ) - ( 5 - rCounts[ a ] ) );

			if ( availableRows.length > 0 ) {
				const pickedRow: number = availableRows[ 0 ];

                grid[ pickedRow ][ col ] = true;

                rCounts[ pickedRow ]++;
				needed--;

				if ( needed > 0 && rng() > 0.5 ) {
					const secondAvail: number[] = [ 0, 1, 2 ].filter( ( r: number ): boolean => !grid[ r ][ col ] && rCounts[ r ] < 5 );

                    if ( secondAvail.length > 0 ) {
						const secondRow: number = secondAvail[ 0 ];

                        grid[ secondRow ][ col ] = true;

                        rCounts[ secondRow ]++;

                        needed--;
					}
				}
			}
		}

		if ( rCounts[ 0 ] === 5 && rCounts[ 1 ] === 5 && rCounts[ 2 ] === 5 ) {
			pattern = grid;

            break;
		}
	}

	if ( !pattern ) {
		pattern = [
			[ true, true, true, true, true, false, false, false, false ],
			[ true, false, true, false, true, false, true, false, true ],
			[ false, true, false, true, false, true, false, true, true ]
		];
	}

	const matrix: ( number | null )[][] = [
		new Array( 9 ).fill( null ),
		new Array( 9 ).fill( null ),
		new Array( 9 ).fill( null )
	];

    const flatNumbers: number[] = [];

	for ( let col: number = 0; col < 9; col++ ) {
		const { colStart, colEnd } = colRanges[ col ];
		const pool: number[] = [];

		for ( let n: number = colStart; n <= colEnd; n++ ) {
			pool.push( n );
		}

		const count: number = ( pattern[ 0 ][ col ] ? 1 : 0 ) + ( pattern[ 1 ][ col ] ? 1 : 0 ) + ( pattern[ 2 ][ col ] ? 1 : 0 );
		const picked: number[] = shuffle( pool, rng ).slice( 0, count ).sort( ( a: number, b: number ): number => a - b );

		let pIdx: number = 0;

        for ( let row: number = 0; row < 3; row++ ) {
			if ( pattern[ row ][ col ] ) {
				const num: number = picked[ pIdx++ ];

                matrix[ row ][ col ] = num;

                flatNumbers.push( num );
			}
		}
	}

	flatNumbers.sort( ( a: number, b: number ): number => a - b );

	return {
		id		: cardId,
		matrix,
		numbers	: flatNumbers
	};
}


export function generateCardboards(
	gameId	: string,
	count	: number = 100,
	start	: number = 1,
	end		: number = 90
): ICardboard[] {
	const list: ICardboard[] = [];

	for ( let i: number = 1; i <= count; i++ ) {
		list.push( generateCardboard( gameId, i, start, end ) );
	}

	return list;
}
