import { compressToUTF16, decompressFromUTF16 } from 'lz-string';
import type { IGame, INewGameParams } from '../types/game';


const STORAGE_KEY: string = 'lumina-loteria-juegos';


export function loadGames(): IGame[] {
	if ( typeof localStorage === 'undefined' ) {
		return [];
	}

	try {
		const raw: string | null = localStorage.getItem( STORAGE_KEY );

        if ( !raw ) {
			return [];
		}

		const decompressed: string = decompressFromUTF16( raw );

        if ( !decompressed ) {
			return [];
		}

		const parsed: unknown = JSON.parse( decompressed );

        if ( !Array.isArray( parsed )) {
			return [];
		}

		const games: IGame[] = parsed.map( ( item: Partial<IGame> ): IGame => {
			return {
				id				: String( item.id ?? crypto.randomUUID() ),
				name			: String( item.name ?? 'Sorteo' ),
				start			: Number( item.start ?? 1 ),
				end				: Number( item.end ?? 90 ),
				canRepeat		: Boolean( item.canRepeat ?? false ),
				enableVoice		: Boolean( item.enableVoice ?? true ),
				drawn			: Array.isArray( item.drawn ) ? item.drawn.map( Number ) : [],
				createdAt		: String( item.createdAt ?? new Date().toISOString() )
			};
		});

		return games;
	} catch {
		return [];
	}
}


export function saveGames( games: IGame[] ): void {
	if ( typeof localStorage === 'undefined' ) {
		return;
	}

    const serialized: string = JSON.stringify( games );
	const compressed: string = compressToUTF16( serialized );

    localStorage.setItem( STORAGE_KEY, compressed );
}


export function createGame( params: INewGameParams ): IGame {
	return {
		id				: crypto.randomUUID(),
		name			: params.name,
		start			: Number( params.start ),
		end				: Number( params.end ),
		canRepeat		: Boolean( params.canRepeat ),
		enableVoice		: Boolean( params.enableVoice ),
		drawn			: [],
		createdAt		: new Date().toISOString()
	};
}


export function drawNext( game: IGame ): IGame | null {
	const totalLength: number = Math.max( 0, game.end - game.start + 1 );
	const numbers: number[] = Array.from(
		({ length: totalLength }),
		( _: unknown, i: number ): number => game.start + i
	);

	const isAvailable = ( n: number ): boolean => !game.drawn.includes( n );
	const available: number[] = game.canRepeat ? numbers : numbers.filter( isAvailable );

	if ( available.length === 0 ) {
		return null;
	}

	const randomIndex       : number = Math.floor( Math.random() * available.length );
	const selectedNumber    : number = available[ randomIndex ];

	return {
		...game,
		drawn			: [ selectedNumber, ...game.drawn ]
	};
}


export function retryCurrentNumber( game: IGame ): IGame | null {
	if ( game.drawn.length === 0 ) {
		return null;
	}

	const drawnWithoutCurrent: number[] = game.drawn.slice( 1 );
	const totalLength: number = Math.max( 0, game.end - game.start + 1 );
	const numbers: number[] = Array.from(
		({ length: totalLength }),
		( _: unknown, i: number ): number => game.start + i
	);

	const isAvailable = ( n: number ): boolean => !drawnWithoutCurrent.includes( n );
	const available: number[] = game.canRepeat ? numbers : numbers.filter( isAvailable );

	if ( available.length === 0 ) {
		return null;
	}

	const randomIndex       : number = Math.floor( Math.random() * available.length );
	const selectedNumber    : number = available[ randomIndex ];

	return {
		...game,
		drawn			: [ selectedNumber, ...drawnWithoutCurrent ]
	};
}


export function updateGameVoice( id: string, games: IGame[], enableVoice: boolean ): IGame[] {
	const updated: IGame[] = games.map( ( game: IGame ): IGame => {
		if ( game.id === id ) {
			return {
				...game,
				enableVoice
			};
		}

        return game;
	});

	saveGames( updated );

    return updated;
}


export function resetGame( game: IGame ): IGame {
	return {
		...game,
		drawn			: []
	};
}


export function deleteGame( id: string, games: IGame[] ): IGame[] {
	const filtered: IGame[] = games.filter( ( game: IGame ): boolean => game.id !== id );

    saveGames( filtered );

    return filtered;
}
