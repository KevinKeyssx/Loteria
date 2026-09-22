import type { ISoundOptions } from '../types/sound';


let lotteryAudio    : HTMLAudioElement | null = null;
let numberAudio     : HTMLAudioElement | null = null;


function getLotteryAudio(): HTMLAudioElement | null {
	if ( typeof window === 'undefined' ) {
		return null;
	}

	if ( !lotteryAudio ) {
		lotteryAudio = new Audio( '/loteria.webm' );
		lotteryAudio.preload = 'auto';
	}

	return lotteryAudio;
}


function getNumberAudio(): HTMLAudioElement | null {
	if ( typeof window === 'undefined' ) {
		return null;
	}

	if ( !numberAudio ) {
		numberAudio         = new Audio( '/number.webm' );
		numberAudio.preload = 'auto';
        numberAudio.volume  = 0.22;
	}

	return numberAudio;
}


export function initSounds(): void {
	getLotteryAudio();
	getNumberAudio();
}


export function playLotterySound( options?: ISoundOptions ): void {
	const audio: HTMLAudioElement | null = getLotteryAudio();

    if ( !audio ) {
		return;
	}

	if ( options?.volume !== undefined ) {
		audio.volume = options.volume;
	}

	if ( options?.playbackRate !== undefined ) {
		audio.playbackRate = options.playbackRate;
	}

	audio.currentTime = 0;
	audio.play().catch((): void => {});
}


export function stopLotterySound(): void {
	if ( !lotteryAudio ) {
		return;
	}

	lotteryAudio.pause();
	lotteryAudio.currentTime = 0;
}


export function playNumberSound( options?: ISoundOptions ): void {
	const audio: HTMLAudioElement | null = getNumberAudio();

    if ( !audio ) {
		return;
	}

	if ( options?.volume !== undefined ) {
		audio.volume = options.volume;
	}

	if ( options?.playbackRate !== undefined ) {
		audio.playbackRate = options.playbackRate;
	}

	audio.currentTime = 0;
	audio.play().catch( (): void => {} );
}


export function stopNumberSound(): void {
	if ( !numberAudio ) {
		return;
	}

	numberAudio.pause();
	numberAudio.currentTime = 0;
}


export function stopAllSounds(): void {
	stopLotterySound();
	stopNumberSound();
}
