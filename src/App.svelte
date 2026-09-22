<script lang="ts">
	import { onMount } from 'svelte';
	import { Sparkles, Plus, Settings2, RotateCcw, Play, Trophy, Hash, X, Volume2, VolumeX, Loader2 } from 'lucide-svelte';
	import AdminPanel from './AdminPanel.svelte';
	import NumberShuffle from './NumberShuffle.svelte';
	import FloatingStars from './FloatingStars.svelte';
	import type { IGame, INewGameParams, IVoiceState } from './types/game';
	import {
		loadGames,
		saveGames,
		createGame,
		drawNext,
		retryCurrentNumber,
		resetGame,
		deleteGame,
		updateGameVoice
	} from './lib/storage';
	import {
		initVoiceEngine,
		subscribeVoiceState,
		prepareGameAudio,
		playAudioBuffer,
		stopCurrentAudio
	} from './lib/voice';

	let games: IGame[] = $state([]);
	let activeId: string | null = $state( null );
	let newName: string = $state( 'Sorteo principal' );
	let start: number = $state( 1 );
	let end: number = $state( 90 );
	let canRepeat: boolean = $state( false );
	let enableVoice: boolean = $state( true );
	let showCreate: boolean = $state( false );
	let showAdmin: boolean = $state( false );
	let isDrawing: boolean = $state( false );
	let currentNumber: number | null = $state( null );
	let error: string = $state( '' );
	let audioGenerationPromise: Promise<AudioBuffer | null> | null = null;

	let voiceState: IVoiceState = $state({
		isReady			: false,
		isLoading		: false,
		progress		: 0,
		statusText		: 'Preparando voz chilena natural...',
		error			: null
	});

	let activeGame: IGame | undefined = $derived( games.find(( g: IGame ): boolean => g.id === activeId) );
	let remaining: number = $derived(
		activeGame ? ( activeGame.canRepeat ? Infinity : activeGame.end - activeGame.start + 1 - activeGame.drawn.length ) : 0
	);

	onMount(() => {
		games = loadGames();
		activeId = games[ 0 ]?.id ?? null;
		currentNumber = games[ 0 ]?.drawn[ 0 ] ?? null;

		const unsubscribe: () => void = subscribeVoiceState(( state: IVoiceState ): void => {
			voiceState = state;
		});

		initVoiceEngine();

		return (): void => {
			unsubscribe();
		};
	});

	function persist( next: IGame[] ): void {
		games = next;
		saveGames( next );
	}

	function newGame(): void {
		error = '';
		if ( !newName.trim() || start < 0 || end <= start || end - start > 9999 ) {
			error = 'Revisa el nombre y el rango (máximo 10.000 números).';
			return;
		}

		const params: INewGameParams = {
			name			: newName.trim(),
			start,
			end,
			canRepeat,
			enableVoice
		};

		const game: IGame = createGame( params );
		persist([ game, ...games ]);
		activeId = game.id;
		showCreate = false;
		currentNumber = null;
		canRepeat = false;
		enableVoice = true;
	}

	function nextNumber(): void {
		if ( !activeGame || isDrawing || remaining === 0 ) {
			return;
		}

		stopCurrentAudio();
		isDrawing = true;
		currentNumber = null;

		const updated: IGame | null = drawNext( activeGame );
		if ( !updated ) {
			isDrawing = false;
			return;
		}

		const nextNum: number = updated.drawn[ 0 ];
		audioGenerationPromise = prepareGameAudio( nextNum, updated.enableVoice );

		setTimeout(async (): Promise<void> => {
			if ( !activeGame ) {
				isDrawing = false;
				return;
			}

			persist( games.map(( g: IGame ): IGame => g.id === activeId ? updated : g) );
			currentNumber = nextNum;
			isDrawing = false;

			if ( audioGenerationPromise ) {
				const buffer: AudioBuffer | null = await audioGenerationPromise;
				playAudioBuffer( buffer );
				audioGenerationPromise = null;
			}
		}, 1050 );
	}

	function retryNumber(): void {
		if ( !activeGame || isDrawing || activeGame.drawn.length === 0 ) {
			return;
		}

		stopCurrentAudio();
		isDrawing = true;
		currentNumber = null;

		const updated: IGame | null = retryCurrentNumber( activeGame );
		if ( !updated ) {
			isDrawing = false;
			return;
		}

		const nextNum: number = updated.drawn[ 0 ];
		audioGenerationPromise = prepareGameAudio( nextNum, updated.enableVoice );

		setTimeout(async (): Promise<void> => {
			if ( !activeGame ) {
				isDrawing = false;
				return;
			}

			persist( games.map(( g: IGame ): IGame => g.id === activeId ? updated : g) );
			currentNumber = nextNum;
			isDrawing = false;

			if ( audioGenerationPromise ) {
				const buffer: AudioBuffer | null = await audioGenerationPromise;
				playAudioBuffer( buffer );
				audioGenerationPromise = null;
			}
		}, 1050 );
	}

	function toggleVoice(): void {
		if ( !activeGame || !voiceState.isReady ) {
			return;
		}
		const nextState: boolean = !activeGame.enableVoice;
		games = updateGameVoice( activeGame.id, games, nextState );
	}

	function reset( id: string ): void {
		persist( games.map(( g: IGame ): IGame => g.id === id ? resetGame( g ) : g) );
		if ( id === activeId ) {
			currentNumber = null;
		}
	}

	function remove( id: string ): void {
		const next: IGame[] = deleteGame( id, games );
		persist( next );
		if ( id === activeId ) {
			activeId = next[ 0 ]?.id ?? null;
			currentNumber = next[ 0 ]?.drawn[ 0 ] ?? null;
		}
	}

	function select( id: string ): void {
		activeId = id;
		currentNumber = games.find(( g: IGame ): boolean => g.id === id)?.drawn[ 0 ] ?? null;
	}
</script>

<svelte:head>
	<title>Lúmina — Sorteos con emoción</title>
	<meta name="description" content="Genera números irrepetibles para tus sorteos." />
	<link rel="icon" type="image/avif" href="/logo_25.avif" />
</svelte:head>

<div class="min-h-screen overflow-hidden bg-[#080d1d] text-slate-100 selection:bg-indigo-400/30">
	<div class="pointer-events-none fixed -left-40 -top-40 h-96 w-96 rounded-full bg-indigo-600/20 blur-3xl"></div>
	<div class="pointer-events-none fixed -bottom-40 -right-20 h-96 w-96 rounded-full bg-teal-500/10 blur-3xl"></div>

	<header class="relative mx-auto flex max-w-6xl items-center justify-between px-6 py-7 lg:px-10">
		<div class="flex items-center gap-3">
			<img src="/logo_50.avif" alt="Lúmina" class="h-11 w-11 rounded-2xl object-contain shadow-lg shadow-indigo-500/25" />
			<div>
				<p class="text-lg font-black tracking-tight">LÚMINA</p>
				<p class="text-[10px] font-bold uppercase tracking-[.25em] text-slate-500">Sorteos con emoción</p>
			</div>
		</div>
		<button onclick={ () => showAdmin = true } class="flex items-center gap-2 rounded-xl border border-white/10 bg-white/4 px-4 py-2.5 text-sm font-bold text-slate-300 transition hover:border-white/20 hover:bg-white/8 hover:text-white">
			<Settings2 size={ 16 } /> Administrar
		</button>
	</header>

	<main class="relative mx-auto max-w-6xl px-6 pb-12 lg:px-10">
		<div class="mb-9 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
			<div>
				<p class="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[.25em] text-teal-300">
					<span class="h-2 w-2 animate-pulse rounded-full bg-teal-300"></span> Generador en vivo
				</p>
				<h1 class="max-w-xl text-4xl font-black leading-[1.05] tracking-tight sm:text-6xl">
					Que la suerte<br />
					<span class="bg-linear-to-r from-indigo-300 via-violet-300 to-teal-200 bg-clip-text text-transparent">elija por ti.</span>
				</h1>
			</div>
			<p class="max-w-xs text-sm leading-relaxed text-slate-400">
				Números al azar, sin repeticiones y con toda la emoción del momento.
			</p>
		</div>

		{#if !activeGame }
			<div class="grid min-h-105 place-items-center rounded-3xl border border-dashed border-white/15 bg-white/2 p-8 text-center">
				<div>
					<div class="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-indigo-500/15 text-indigo-300">
						<Trophy size={ 30 } />
					</div>
					<h2 class="mb-2 text-2xl font-black">Crea tu primer juego</h2>
					<p class="mb-6 text-slate-400">Define el rango y empieza a sortear.</p>
					<button onclick={ () => showCreate = true } class="rounded-xl bg-indigo-400 px-5 py-3 font-bold text-slate-950 transition hover:bg-indigo-300">
						<Plus class="mr-2 inline" size={ 18 } /> Nuevo juego
					</button>
				</div>
			</div>
		{:else}
			<div class="grid gap-6 lg:grid-cols-[1fr_340px]">
				<section class="glow relative overflow-hidden rounded-3xl border border-white/10 bg-white/4.5 p-6 sm:p-10">
					<div class="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full border border-indigo-300/10 animate-spin-slow"></div>
					<div class="mb-8 flex flex-wrap items-start justify-between gap-4">
						<div>
							<div class="mb-2 flex items-center gap-2 text-sm font-bold text-slate-300">
								<Hash size={ 15 } class="text-teal-300" /> { activeGame.name }
							</div>
							<p class="text-xs text-slate-500">
								Rango { activeGame.start } — { activeGame.end } · { activeGame.canRepeat ? 'Números repetibles' : 'Sin repeticiones' }
							</p>
						</div>
						<button
							disabled={ activeGame.drawn.length === 0 || isDrawing }
							onclick={ retryNumber }
							class="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold text-slate-400 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
							title="Descartar el número actual y sortear uno nuevo"
						>
							<RotateCcw size={ 14 } /> Reintentar
						</button>
					</div>

					<div class="relative flex min-h-75 flex-col items-center justify-center overflow-hidden rounded-3xl border border-indigo-300/10 bg-[#0b1125] py-10">
						<div class="absolute inset-x-20 top-0 h-px animate-shimmer bg-linear-to-r from-transparent via-indigo-300/60 to-transparent"></div>
						{#if isDrawing }
							<NumberShuffle start={ activeGame.start } end={ activeGame.end } />
						{:else if currentNumber !== null }
							<FloatingStars />
							<div class="relative z-10 flex flex-col items-center justify-center">
								<p class="mb-3 text-xs font-bold uppercase tracking-[.3em] text-teal-300">Número elegido</p>
								<div class="number-glow animate-pop text-9xl font-black tracking-tighter text-white">{ currentNumber }</div>
								<p class="mt-5 text-sm text-slate-500">¡Anótalo, es irrepetible!</p>
							</div>
						{:else}
							<div class="mb-5 grid h-20 w-20 place-items-center rounded-3xl bg-indigo-500/10 text-indigo-300">
								<Sparkles size={ 35 } />
							</div>
							<p class="text-sm text-slate-400">Pulsa el botón para revelar un número</p>
						{/if}
					</div>

					<button
						disabled={ remaining === 0 || isDrawing }
						onclick={ nextNumber }
						class="mt-6 flex w-full items-center justify-center gap-3 rounded-2xl bg-linear-to-r from-indigo-400 to-violet-400 py-4 font-black text-indigo-100 shadow-lg shadow-indigo-500/20 transition hover:scale-[1.01] hover:from-indigo-300 hover:to-violet-300 disabled:cursor-not-allowed disabled:opacity-40"
					>
						<Play size={ 18 } fill="currentColor" /> { remaining === 0 ? 'Todos los números salieron' : 'Siguiente número' }
						<span class="ml-2 rounded-full bg-slate-950/15 px-2 py-1 text-xs">
							{ activeGame.canRepeat ? '∞ disponibles' : `${ remaining } restantes` }
						</span>
					</button>

					<div class="mt-4 rounded-2xl border border-white/10 bg-white/3 p-4">
						<div class="flex items-center justify-between">
							<div class="flex items-center gap-3">
								{#if !voiceState.isReady }
									<div class="rounded-lg bg-indigo-500/15 p-2 text-indigo-300">
										<Loader2 size={ 18 } class="animate-spin" />
									</div>
								{:else if activeGame.enableVoice }
									<div class="rounded-lg bg-teal-400/15 p-2 text-teal-300">
										<Volume2 size={ 18 } />
									</div>
								{:else}
									<div class="rounded-lg bg-slate-700/30 p-2 text-slate-500">
										<VolumeX size={ 18 } />
									</div>
								{/if}
								<div>
									<span class="block text-xs font-bold text-slate-200">Cantar números con voz chilena</span>
									<span class="block text-[11px] text-slate-400">
										{#if !voiceState.isReady }
											{ voiceState.statusText }
										{:else if activeGame.enableVoice }
											{ voiceState.statusText }
										{:else}
											Voz desactivada
										{/if}
									</span>
								</div>
							</div>

							<button
								type="button"
								role="switch"
								disabled={ !voiceState.isReady }
								aria-checked={ activeGame.enableVoice && voiceState.isReady }
								onclick={ toggleVoice }
								class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-300/70 disabled:cursor-not-allowed disabled:opacity-40 { activeGame.enableVoice && voiceState.isReady ? 'bg-teal-400' : 'bg-slate-700' }"
								title={ !voiceState.isReady ? 'Descargando modelo de voz...' : 'Activar o desactivar voz' }
							>
								<span class="sr-only">Activar o desactivar voz</span>
								<span class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out { activeGame.enableVoice && voiceState.isReady ? 'translate-x-5' : 'translate-x-0' }"></span>
							</button>
						</div>

						{#if !voiceState.isReady }
							<div class="mt-3 border-t border-white/5 pt-3">
								<div class="mb-1.5 flex items-center justify-between text-[11px]">
									<span class="font-medium text-slate-400">{ voiceState.statusText }</span>
									<span class="font-bold text-teal-300">{ voiceState.progress }%</span>
								</div>
								<div class="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
									<div
										class="h-full rounded-full bg-linear-to-r from-indigo-400 to-teal-300 transition-all duration-300"
										style="width: { voiceState.progress }%"
									></div>
								</div>
							</div>
						{/if}
					</div>
				</section>

				<aside class="rounded-3xl border border-white/10 bg-white/[.035] p-5">
					<div class="mb-5 flex items-center justify-between">
						<div>
							<p class="text-sm font-black">Historial</p>
							<p class="text-xs text-slate-500">{ activeGame.drawn.length } números salidos</p>
						</div>
						<div class="rounded-lg bg-teal-400/10 px-2 py-1 text-xs font-black text-teal-300">EN VIVO</div>
					</div>

					{#if activeGame.drawn.length === 0 }
						<div class="grid h-64 place-items-center rounded-2xl border border-dashed border-white/10 text-center text-sm text-slate-500">
							Tu historial aparecerá<br />aquí al comenzar.
						</div>
					{:else}
						<div class="grid max-h-117.5 grid-cols-3 gap-2 overflow-y-auto pr-1 sm:grid-cols-4 lg:grid-cols-3">
							{#each activeGame.drawn as number, i ( `${ number }-${ i }` ) }
								<div class="group relative rounded-xl border border-white/10 bg-white/5 py-3 text-center transition hover:border-indigo-300/40 hover:bg-indigo-400/10">
									<span class="text-lg font-black">{ number }</span>
									{#if i === 0 }
										<span class="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-teal-300 shadow-[0_0_10px_#5eead4]"></span>
									{/if}
								</div>
							{/each}
						</div>
					{/if}
				</aside>
			</div>
		{/if}

		<div class="mt-6 flex items-center justify-between rounded-2xl border border-white/10 bg-white/2.5 p-4">
			<div class="flex items-center gap-3 overflow-x-auto">
				{#each games.slice( 0, 4 ) as game ( game.id ) }
					<button
						onclick={ () => select( game.id ) }
						class="flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold transition { game.id === activeId ? 'bg-indigo-400/15 text-indigo-200' : 'text-slate-500 hover:bg-white/5 hover:text-slate-300' }"
					>
						<span class="h-2 w-2 rounded-full { game.id === activeId ? 'bg-indigo-300' : 'bg-slate-600' }"></span>
						{ game.name }
					</button>
				{/each}
			</div>
			<button onclick={ () => showCreate = true } class="flex shrink-0 items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-xs font-bold text-slate-200 transition hover:bg-white/15">
				<Plus size={ 15 } /> <span class="hidden sm:inline">Nuevo juego</span>
			</button>
		</div>
	</main>

	{#if showCreate }
		<div class="fixed inset-0 z-20 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
			<section class="w-full max-w-md rounded-3xl border border-white/10 bg-[#11182e] p-7 shadow-2xl">
				<div class="mb-6 flex items-start justify-between">
					<div>
						<p class="mb-1 text-xs font-bold uppercase tracking-[.2em] text-teal-300">Nuevo sorteo</p>
						<h2 class="text-2xl font-black">Configura tu juego</h2>
					</div>
					<button onclick={ () => showCreate = false } class="text-slate-500 hover:text-white" aria-label="Cerrar">
						<X size={ 20 } />
					</button>
				</div>

				<div class="space-y-4">
					<label class="block text-sm font-bold text-slate-300">
						Nombre del juego
						<input bind:value={ newName } class="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition focus:border-indigo-400" placeholder="Ej. Rifa de verano" />
					</label>

					<div class="grid grid-cols-2 gap-3">
						<label class="block text-sm font-bold text-slate-300">
							Desde
							<input type="number" bind:value={ start } class="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-indigo-400" />
						</label>
						<label class="block text-sm font-bold text-slate-300">
							Hasta
							<input type="number" bind:value={ end } class="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-indigo-400" />
						</label>
					</div>

					<label class="flex cursor-pointer items-center justify-between rounded-xl border border-white/10 bg-white/3 p-4">
						<span>
							<span class="block text-sm font-bold text-slate-200">Permitir repeticiones</span>
							<span class="mt-1 block text-xs font-normal text-slate-500">Un número puede volver a salir en este juego</span>
						</span>
						<input type="checkbox" bind:checked={ canRepeat } class="peer sr-only" />
						<span class="relative h-6 w-11 rounded-full bg-slate-700 transition peer-checked:bg-teal-400 peer-focus-visible:ring-2 peer-focus-visible:ring-teal-300/70">
							<span class="absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition peer-checked:translate-x-5"></span>
						</span>
					</label>

					<label class="flex cursor-pointer items-center justify-between rounded-xl border border-white/10 bg-white/3 p-4">
						<span>
							<span class="block text-sm font-bold text-slate-200">Cantar números con voz chilena</span>
							<span class="mt-1 block text-xs font-normal text-slate-500">Locución con frases dinámicas al sortear</span>
						</span>
						<input type="checkbox" bind:checked={ enableVoice } class="peer sr-only" />
						<span class="relative h-6 w-11 rounded-full bg-slate-700 transition peer-checked:bg-teal-400 peer-focus-visible:ring-2 peer-focus-visible:ring-teal-300/70">
							<span class="absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition peer-checked:translate-x-5"></span>
						</span>
					</label>

					{#if error }
						<p class="rounded-xl bg-rose-400/10 p-3 text-xs font-bold text-rose-300">{ error }</p>
					{/if}

					<button onclick={ newGame } class="mt-2 w-full rounded-xl bg-indigo-400 py-3.5 font-black text-slate-950 transition hover:bg-indigo-300">
						Crear juego
					</button>
				</div>
			</section>
		</div>
	{/if}

	{#if showAdmin }
		<AdminPanel { games } onReset={ reset } onDelete={ remove } onClose={ () => showAdmin = false } />
	{/if}
</div>
