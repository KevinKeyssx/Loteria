import { numberToSpanishWords } from './numberWords';
import type { IProgressCallbackData, ITTSResult, IVoiceState } from '../types/game';

type TTSFunction = ( text: string ) => Promise<ITTSResult>;

let synthesizer: TTSFunction | null = null;
let isInitializing: boolean = false;
let audioCtx: AudioContext | null = null;
let currentSource: AudioBufferSourceNode | null = null;
const audioCache: Map<number, AudioBuffer> = new Map();

let voiceState: IVoiceState = {
	isReady			: false,
	isLoading		: false,
	progress		: 0,
	statusText		: 'Preparando voz chilena natural...',
	error			: null
};

const listeners: (( state: IVoiceState ) => void)[] = [];

function notifyListeners(): void {
	listeners.forEach(( listener: ( state: IVoiceState ) => void ): void => {
		listener( voiceState );
	});
}

function updateState( updates: Partial<IVoiceState> ): void {
	voiceState = {
		...voiceState,
		...updates
	};
	notifyListeners();
}

export function subscribeVoiceState( callback: ( state: IVoiceState ) => void ): () => void {
	listeners.push( callback );
	callback( voiceState );
	return (): void => {
		const index: number = listeners.indexOf( callback );
		if ( index > -1 ) {
			listeners.splice( index, 1 );
		}
	};
}

function getAudioContext(): AudioContext | null {
	if ( typeof window === 'undefined' ) {
		return null;
	}

	if ( !audioCtx ) {
		const AudioContextClass = window.AudioContext || ( window as unknown as { webkitAudioContext: typeof AudioContext } ).webkitAudioContext;
		if ( !AudioContextClass ) {
			return null;
		}
		audioCtx = new AudioContextClass();
	}

	if ( audioCtx.state === 'suspended' ) {
		audioCtx.resume();
	}

	return audioCtx;
}

export function stopCurrentAudio(): void {
	if ( currentSource ) {
		try {
			currentSource.stop();
		} catch {
			// Ya estaba detenido
		}
		currentSource = null;
	}
}

function buildPhrase( n: number ): string {
	const word: string = numberToSpanishWords( n );

    if ( n === 5 )  {
        return 'Cinco, cinco, sin corriente.';
    }

	if ( n === 3 ) {
		return 'La niña bonita, tres.';
	}

	if ( n === 11 ) {
		return 'El número once, sigamos entonces.';
	}

	if ( n === 13 ) {
		return 'La niña bonita, trece.';
	}

	if ( n === 18 ) {
		return 'El dieciocho, viva Chile.';
	}

	if ( n === 22 ) {
		return 'Par de patos, veintidós.';
	}

	if ( n === 33 ) {
		return 'La edad de Cristo, treinta y tres.';
	}

	if ( n === 77 ) {
		return 'Las dos hachas, setenta y siete.';
	}

	if ( n === 99 ) {
        return 'Noventa y nueve, el potito se te mueve.';
    }


	const regularPhrases: (( w: string ) => string)[] = [
		( w: string ): string => `Sale el ${ w }.`,
		// ( w: string ): string => `Atentos chiquillos, cayó el ${ w }.`,
		( w: string ): string => `El número ${ w } al toque.`,
		// ( w: string ): string => `Se vino el ${ w }.`,
		// ( w: string ): string => `Ojo al charqui con el ${ w }.`,
		( w: string ): string => `Mucha suerte con el ${ w }.`,
		( w: string ): string => `Anota el ${ w }, compadre.`,
		( w: string ): string => `El ${ w }, buena suerte.`,
		( w: string ): string => `Atención, salió el ${ w }.`,
		( w: string ): string => `El número ${ w }, al tiro.`,
		( w: string ): string => `Y la bolita dice, ${ w }.`,
	];

	if ( n < 10 ) {
		const singleDigitPhrases: (( w: string ) => string)[] = [
			( w: string ): string => `Solito el ${ w }, compadre.`,
			( w: string ): string => `Solito el ${ w }, al tiro.`,
			( w: string ): string => `El solitario ${ w }.`,
			( w: string ): string => `Solito el ${ w }, como perro en bote.`,
			( w: string ): string => `Solito el ${ w }, cachái.`
		];

		const pool: (( w: string ) => string)[] = [ ...regularPhrases, ...singleDigitPhrases ];
		const randomIndex: number = Math.floor( Math.random() * pool.length );
		const generator: (( w: string ) => string) = pool[ randomIndex ];
		return generator( word );
	}

	const randomIndex: number = Math.floor( Math.random() * regularPhrases.length );
	const generator: (( w: string ) => string) = regularPhrases[ randomIndex ];
	return generator( word );
}

export async function initVoiceEngine(): Promise<void> {
	if ( voiceState.isReady || isInitializing || typeof window === 'undefined' ) {
		return;
	}

	isInitializing = true;
	updateState({
		isLoading		: true,
		progress		: 5,
		statusText		: 'Iniciando descarga de voz chilena natural...'
	});

	try {
		const transformers = await import( '@huggingface/transformers' );
		transformers.env.allowLocalModels = false;
		transformers.env.useBrowserCache = true;

		const hasWebGPU: boolean = typeof navigator !== 'undefined' && 'gpu' in navigator;
		const deviceName: 'webgpu' | 'wasm' = hasWebGPU ? 'webgpu' : 'wasm';

		if ( !hasWebGPU && typeof navigator !== 'undefined' && transformers.env.backends?.onnx?.wasm ) {
			transformers.env.backends.onnx.wasm.numThreads = Math.min( 4, navigator.hardwareConcurrency || 2 );
		}

		const pipeCreator = transformers.pipeline as unknown as (
			task: string,
			model: string,
			options: {
				device				: string;
				quantized			: boolean;
				progress_callback	: ( data: IProgressCallbackData ) => void;
			}
		) => Promise<TTSFunction>;

		synthesizer = await pipeCreator(
			'text-to-speech',
			'Xenova/mms-tts-spa',
			({
				device				: deviceName,
				quantized			: true,
				progress_callback	: ( data: IProgressCallbackData ): void => {
					if ( data.status === 'progress' && typeof data.progress === 'number' ) {
						const pct: number = Math.min( 99, Math.max( 5, Math.round( data.progress ) ) );
						updateState({
							progress		: pct,
							statusText		: `Descargando voz chilena natural (${ pct }%)...`
						});
					} else if ( data.status === 'done' ) {
						updateState({
							progress		: 99,
							statusText		: 'Finalizando preparación del modelo...'
						});
					}
				}
			})
		);

		updateState({
			isReady			: true,
			isLoading		: false,
			progress		: 100,
			statusText		: hasWebGPU ? 'Voz natural chilena lista (WebGPU)' : 'Voz natural chilena lista (WASM)',
			error			: null
		});
	} catch ( err: unknown ) {
		console.error( 'Error al inicializar el modelo de voz:', err );
		updateState({
			isReady			: false,
			isLoading		: false,
			progress		: 0,
			statusText		: 'No se pudo cargar la voz neuronal',
			error			: 'Error al descargar el modelo de voz'
		});
	} finally {
		isInitializing = false;
	}
}

export async function prepareGameAudio( n: number, enabled: boolean ): Promise<AudioBuffer | null> {
	if ( !enabled || !voiceState.isReady || !synthesizer ) {
		return null;
	}

	if ( audioCache.has( n ) ) {
		return audioCache.get( n ) ?? null;
	}

	try {
		const phrase: string = buildPhrase( n );
		const result: ITTSResult = await synthesizer( phrase );

		const ctx: AudioContext | null = getAudioContext();
		if ( !ctx || !result.audio ) {
			return null;
		}

		const buffer: AudioBuffer = ctx.createBuffer( 1, result.audio.length, result.sampling_rate );
		buffer.getChannelData( 0 ).set( result.audio );

		audioCache.set( n, buffer );
		return buffer;
	} catch ( err: unknown ) {
		console.error( 'Error al sintetizar el audio en paralelo:', err );
		return null;
	}
}

export function playAudioBuffer( buffer: AudioBuffer | null ): void {
	if ( !buffer ) {
		return;
	}

	stopCurrentAudio();

	const ctx: AudioContext | null = getAudioContext();
	if ( !ctx ) {
		return;
	}

	const source: AudioBufferSourceNode = ctx.createBufferSource();
	source.buffer = buffer;
	source.connect( ctx.destination );
	source.start();

	currentSource = source;
}

export async function speakGameNumber( n: number, enabled: boolean ): Promise<void> {
	if ( !enabled || !voiceState.isReady || !synthesizer ) {
		return;
	}

	const buffer: AudioBuffer | null = await prepareGameAudio( n, enabled );
	playAudioBuffer( buffer );
}
