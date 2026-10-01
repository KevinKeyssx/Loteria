<script lang="ts">
	import { Sparkles, Trophy, CircleCheck } from 'lucide-svelte';

    import type { ICardboardProps } from '../../types/cardboard';


    let {
		cardboard,
		drawn,
		currentNumber	= null
	}: ICardboardProps = $props();


    let drawnSet        : Set<number>   = $derived( new Set( drawn ) );
	let matchedNumbers  : number[]      = $derived( cardboard.numbers.filter(( n: number ): boolean => drawnSet.has( n )));
	let matchedCount    : number        = $derived( matchedNumbers.length );
	let totalCount      : number        = $derived( cardboard.numbers.length );
	let progressPercent : number        = $derived( Math.round(( matchedCount / ( totalCount || 1 )) * 100 ));
	let isBingo         : boolean       = $derived( totalCount > 0 && matchedCount === totalCount );
	let isNearBingo     : boolean       = $derived( totalCount > 0 && matchedCount === totalCount - 1 );
</script>

<div class="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/70 p-3 sm:p-4 shadow-xl backdrop-blur-sm transition-all duration-300 { isBingo ? 'ring-2 ring-teal-400 shadow-[0_0_25px_rgba(45,212,191,0.25)]' : '' }">
	<div class="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
		<div class="flex items-center gap-2">
			<div class="grid h-7 w-7 place-items-center rounded-lg bg-indigo-500/20 text-indigo-300">
				<span class="text-xs font-black">#{ cardboard.id }</span>
			</div>

            <div>
				<h3 class="text-sm font-black text-slate-100">Cartón { cardboard.id }</h3>

                <p class="text-[11px] text-slate-400">
					{ matchedCount } de { totalCount } números salidos
				</p>
			</div>
		</div>

		<div>
			{#if isBingo }
				<span class="inline-flex items-center gap-1.5 rounded-full bg-teal-400/20 px-2.5 py-1 text-xs font-black text-teal-300 ring-1 ring-teal-400/50 animate-bounce">
					<Trophy size={ 13 } /> ¡BINGO COMPLETO!
				</span>
			{:else if isNearBingo }
				<span class="inline-flex items-center gap-1 rounded-full bg-amber-400/20 px-2.5 py-1 text-xs font-black text-amber-300 ring-1 ring-amber-400/40 animate-pulse">
					<Sparkles size={ 13 } /> ¡A 1 del Bingo!
				</span>
			{:else}
				<span class="rounded-lg bg-white/5 px-2 py-1 text-xs font-bold text-slate-300">
					{ progressPercent }% completado
				</span>
			{/if}
		</div>
	</div>

	<div class="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-800/80">
		<div
			class="h-full rounded-full transition-all duration-500 ease-out { isBingo ? 'bg-linear-to-r from-teal-400 to-emerald-300' : 'bg-linear-to-r from-indigo-500 to-teal-400' }"
			style="width: { progressPercent }%"
		></div>
	</div>

	<div class="grid grid-cols-9 gap-1 sm:gap-1.5">
		{#each cardboard.matrix as row, rowIdx ( rowIdx ) }
			{#each row as cell, colIdx ( `${ rowIdx }-${ colIdx }` ) }
				{#if cell !== null }
					{@const isDrawn = drawnSet.has( cell )}
					{@const isCurrent = currentNumber === cell}

                    <div
						class="relative flex h-8 sm:h-10 items-center justify-center rounded-lg border text-xs sm:text-sm font-black transition-all duration-300 select-none {
							isCurrent
								? 'border-teal-300 bg-teal-400 text-slate-950 shadow-[0_0_15px_#2dd4bf] scale-105 z-10 animate-pulse'
								: isDrawn
									? 'border-teal-400/60 bg-teal-500/25 text-teal-200 shadow-[0_0_10px_rgba(45,212,191,0.3)] ring-1 ring-teal-400/40'
									: 'border-white/10 bg-white/4 text-slate-200 hover:border-white/20 hover:bg-white/8'
						}"
						title={ isDrawn ? `Número ${ cell } (Ya salió)` : `Número ${ cell }` }
					>
						<span>{ cell }</span>

                        {#if isDrawn && !isCurrent }
							<span class="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-teal-300 shadow-[0_0_6px_#5eead4]"></span>
						{/if}
					</div>
				{:else}
					<div
						class="flex h-8 sm:h-10 items-center justify-center rounded-lg border border-dashed border-white/5 bg-white/1.5"
						aria-hidden="true"
					>
						<span class="h-1 w-1 rounded-full bg-white/10"></span>
					</div>
				{/if}
			{/each}
		{/each}
	</div>

	<div class="mt-3 rounded-xl border border-white/5 bg-white/2.5 p-2.5">
		<div class="mb-1.5 flex items-center justify-between text-[11px] font-bold">
			<span class="text-slate-400">Números acertados de este cartón:</span>
			<span class="text-teal-300">{ matchedCount } / { totalCount }</span>
		</div>

		{#if matchedNumbers.length === 0 }
			<p class="py-1 text-center text-xs text-slate-500">
				Aún no ha salido ningún número de este cartón.
			</p>
		{:else}
			<div class="flex flex-wrap gap-1.5">
				{#each matchedNumbers as num ( num ) }
					<span
						class="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-bold transition {
							currentNumber === num
								? 'bg-teal-400 text-slate-950 shadow-[0_0_8px_#2dd4bf]'
								: 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
						}"
					>
						<CircleCheck size={ 11 } />
						{ num }
					</span>
				{/each}
			</div>
		{/if}
	</div>
</div>
