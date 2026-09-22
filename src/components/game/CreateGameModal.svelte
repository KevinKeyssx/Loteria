<script lang="ts">
	import { X } from 'lucide-svelte';
	import Switcher from '../inputs/Switcher.svelte';
	import type { ICreateGameModalProps } from '../../types/game';

	let {
		error		= '',
		onClose,
		onCreate
	}: ICreateGameModalProps = $props();

	let name: string = $state( 'Sorteo principal' );
	let start: number = $state( 1 );
	let end: number = $state( 90 );
	let canRepeat: boolean = $state( false );
	let enableVoice: boolean = $state( true );
	let localError: string = $state( '' );

	function handleSubmit(): void {
		if ( !name.trim() ) {
			localError = 'Ingresa un nombre para el juego.';
			return;
		}

		if ( end <= start ) {
			localError = 'El valor "Hasta" debe ser mayor que "Desde".';
			return;
		}

		localError = '';
		onCreate({
			name			: name.trim(),
			start			: Number( start ),
			end				: Number( end ),
			canRepeat		: Boolean( canRepeat ),
			enableVoice		: Boolean( enableVoice )
		});
	}
</script>

<div class="fixed inset-0 z-30 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Crear nuevo juego">
	<section class="w-full max-w-md rounded-3xl border border-white/10 bg-[#11182e] p-7 shadow-2xl">
		<div class="mb-6 flex items-start justify-between">
			<div>
				<p class="mb-1 text-xs font-bold uppercase tracking-[.2em] text-teal-300">Nuevo sorteo</p>
				<h2 class="text-2xl font-black">Configura tu juego</h2>
			</div>
			<button onclick={ onClose } class="text-slate-500 transition hover:text-white" aria-label="Cerrar">
				<X size={ 20 } />
			</button>
		</div>

		<div class="space-y-4">
			<label class="block text-sm font-bold text-slate-300">
				Nombre del juego
				<input bind:value={ name } class="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition focus:border-indigo-400" placeholder="Ej. Rifa de verano" />
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

			<Switcher
				title="Permitir repeticiones"
				description="Un número puede volver a salir en este juego"
				bind:checked={ canRepeat }
			/>

			<Switcher
				title="Cantar números con voz chilena"
				description="Locución con frases dinámicas al sortear"
				bind:checked={ enableVoice }
			/>

			{#if localError || error }
				<p class="rounded-xl bg-rose-400/10 p-3 text-xs font-bold text-rose-300">{ localError || error }</p>
			{/if}

			<button onclick={ handleSubmit } class="mt-2 w-full rounded-xl bg-indigo-400 py-3.5 font-black text-slate-950 transition hover:bg-indigo-300">
				Crear juego
			</button>
		</div>
	</section>
</div>
