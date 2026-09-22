<script lang="ts">
	import { Trash2, RotateCcw, Archive, X } from 'lucide-svelte';
	import type { IAdminPanelProps } from './types/game';

	let { games = [], onReset, onDelete, onClose }: IAdminPanelProps = $props();
</script>

<div class="fixed inset-0 z-30 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Administrador local">
	<section class="w-full max-w-2xl overflow-hidden rounded-3xl border border-white/10 bg-[#11182e] shadow-2xl shadow-indigo-950/50">
		<header class="flex items-center justify-between border-b border-white/10 p-6">
			<div class="flex items-center gap-3">
				<div class="rounded-xl bg-indigo-500/15 p-2 text-indigo-300">
					<Archive size={ 20 } />
				</div>
				<div>
					<p class="text-xs font-bold uppercase tracking-[.2em] text-indigo-300">Administrador local</p>
					<h2 class="text-xl font-black">Tus juegos guardados</h2>
				</div>
			</div>
			<button onclick={ onClose } class="rounded-full p-2 text-slate-400 transition hover:bg-white/10 hover:text-white" aria-label="Cerrar">
				<X size={ 20 } />
			</button>
		</header>

		<div class="max-h-[65vh] space-y-3 overflow-y-auto p-6">
			{#if games.length === 0 }
				<div class="rounded-2xl border border-dashed border-white/10 p-10 text-center text-slate-400">
					Aún no has creado ningún juego.
				</div>
			{/if}

			{#each games as game ( game.id ) }
				<article class="flex items-center justify-between rounded-2xl border border-white/10 bg-white/4 p-4">
					<div>
						<h3 class="font-bold">{ game.name }</h3>
						<p class="mt-1 text-sm text-slate-400">
							Rango { game.start } — { game.end } · { game.drawn.length } números salidos
						</p>
					</div>
					<div class="flex gap-2">
						<button onclick={ () => onReset( game.id ) } class="rounded-xl p-2 text-slate-400 transition hover:bg-amber-400/10 hover:text-amber-300" title="Reiniciar historial a cero">
							<RotateCcw size={ 17 } />
						</button>
						<button onclick={ () => onDelete( game.id ) } class="rounded-xl p-2 text-slate-400 transition hover:bg-rose-400/10 hover:text-rose-300" title="Borrar juego">
							<Trash2 size={ 17 } />
						</button>
					</div>
				</article>
			{/each}
		</div>

		<footer class="border-t border-white/10 px-6 py-4 text-xs text-slate-500">
			Los datos viven únicamente en este navegador.
		</footer>
	</section>
</div>
