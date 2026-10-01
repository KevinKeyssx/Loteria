<script lang="ts">
	import {
		Layers,
		ArrowDownUp,
		RotateCcw,
		Search,
		ChevronLeft,
		ChevronRight,
		ArrowUp,
		ArrowDown
	} from 'lucide-svelte';

	import type {
        IHistoryProps,
        TSortOrder,
        ICardboard
    }                               from '../../types/cardboard';
    import Cardboard                from './Cardboard.svelte';
	import { generateCardboard }    from '../../lib/cardboard';


    let {
		drawn,
		gameId,
		currentNumber	= null,
		start			= 1,
		end				= 90,
		cardboardsCount = 100
	}: IHistoryProps = $props();


    type TTab = 'cardboard' | 'order';

	let activeTab       : TTab          = $state( 'cardboard' );
	let sortOrder       : TSortOrder    = $state( 'original' );
	let selectedCardId  : number        = $state( 1 );
	let searchInput     : string        = $state( '1' );


    let totalCardboards     : number        = $derived( cardboardsCount );
    let currentCardboard    : ICardboard    = $derived( generateCardboard( gameId, selectedCardId, start, end ));
	let sortedDrawn         : number[]      = $derived.by( (): number[] => {
		if ( sortOrder === 'asc' ) {
			return [ ...drawn ].sort( ( a: number, b: number ): number => a - b );
		}

        if ( sortOrder === 'desc' ) {
			return [ ...drawn ].sort( ( a: number, b: number ): number => b - a );
		}

        return drawn;
	});


    const handleTabChange   = ( tab: TTab ): void => { activeTab = tab }
    const handleSortChange  = ( order: TSortOrder ): void => { sortOrder = order }
    const resetSort         = (): void => { sortOrder = 'original' }


    function setCardboard( id: number ): void {
		const validId: number = Math.max( 1, Math.min( totalCardboards, id ) );

        selectedCardId  = validId;
		searchInput     = String( validId );
	}


    function handlePrev(): void {
		if ( selectedCardId > 1 ) {
			setCardboard( selectedCardId - 1 );
		}
	}


    function handleNext(): void {
		if ( selectedCardId < totalCardboards ) {
			setCardboard( selectedCardId + 1 );
		}
	}


    function handleInputChange( event: Event ): void {
		const target: HTMLInputElement = event.target as HTMLInputElement;
		const parsed: number = parseInt( target.value, 10 );

		if ( !isNaN( parsed ) && parsed >= 1 && parsed <= totalCardboards ) {
			selectedCardId = parsed;
			searchInput = String( parsed );
		} else {
			searchInput = target.value;
		}
	}


    function handleInputBlur(): void {
		const parsed: number = parseInt( searchInput, 10 );

        if ( isNaN( parsed ) || parsed < 1 || parsed > totalCardboards ) {
			searchInput = String( selectedCardId );
		}
	}
</script>

<aside class="flex flex-col rounded-3xl border border-white/10 bg-white/[.035] p-5 shadow-2xl">
	<div class="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
		<div class="flex items-center gap-1 rounded-xl border border-white/5 bg-slate-900/80 p-1">
			<button
				type="button"
				onclick={ () => handleTabChange( 'cardboard' ) }
				class="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-black transition-all { activeTab === 'cardboard' ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/30' : 'text-slate-400 hover:text-white' }"
			>
				<Layers size={ 14 } />

                <span>Por cartón</span>
			</button>

			<button
				type="button"
				onclick={ () => handleTabChange( 'order' ) }
				class="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-black transition-all { activeTab === 'order' ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/30' : 'text-slate-400 hover:text-white' }"
			>
				<ArrowDownUp size={ 14 } />
				<span>Por orden</span>
			</button>
		</div>

		<div class="rounded-lg bg-teal-400/10 px-2.5 py-1 text-xs font-black text-teal-300">
			EN VIVO
		</div>
	</div>

	{#if activeTab === 'cardboard' }
		<div class="space-y-4">
			<div class="rounded-2xl border border-white/10 bg-white/3 p-3">
				<div class="mb-2 flex items-center justify-between text-xs font-bold text-slate-300">
					<span class="flex items-center gap-1.5">
						<Search size={ 13 } class="text-teal-300" /> Buscar por N° de cartón
					</span>
					<span class="text-[11px] text-slate-500">Total: { totalCardboards }</span>
				</div>

				<div class="flex items-center gap-2">
					<button
						type="button"
						onclick={ handlePrev }
						disabled={ selectedCardId <= 1 }
						class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
						title="Cartón anterior"
					>
						<ChevronLeft size={ 16 } />
					</button>

					<div class="relative flex-1">
						<input
							type="number"
							min="1"
							max={ totalCardboards }
							value={ searchInput }
							oninput={ handleInputChange }
							onblur={ handleInputBlur }
							class="w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-center text-sm font-black text-slate-100 outline-none transition focus:border-indigo-400"
							placeholder="1 - 100"
						/>
					</div>

					<button
						type="button"
						onclick={ handleNext }
						disabled={ selectedCardId >= totalCardboards }
						class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
						title="Cartón siguiente"
					>
						<ChevronRight size={ 16 } />
					</button>
				</div>
			</div>

			<Cardboard
				cardboard={ currentCardboard }
				{ drawn }
				{ currentNumber }
			/>
		</div>
	{:else}
		<div class="flex flex-col">
			<div class="mb-4 flex flex-wrap items-center justify-between gap-2">
				<div>
					<p class="text-sm font-black text-slate-100">Historial</p>
					<p class="text-xs text-slate-500">{ drawn.length } números salidos</p>
				</div>

				<div class="flex items-center gap-1">
					<div class="flex items-center rounded-lg border border-white/10 bg-slate-900/80 p-0.5">
						<button
							type="button"
							onclick={ () => handleSortChange( 'original' ) }
							class="rounded-md px-2 py-1 text-[11px] font-bold transition { sortOrder === 'original' ? 'bg-indigo-500 text-white' : 'text-slate-400 hover:text-slate-200' }"
							title="Orden original de extracción"
						>
							Original
						</button>

						<button
							type="button"
							onclick={ () => handleSortChange( 'asc' ) }
							class="flex items-center gap-0.5 rounded-md px-2 py-1 text-[11px] font-bold transition { sortOrder === 'asc' ? 'bg-indigo-500 text-white' : 'text-slate-400 hover:text-slate-200' }"
							title="Menor a mayor"
						>
							<ArrowUp size={ 11 } />
							Asc
						</button>

						<button
							type="button"
							onclick={ () => handleSortChange( 'desc' ) }
							class="flex items-center gap-0.5 rounded-md px-2 py-1 text-[11px] font-bold transition { sortOrder === 'desc' ? 'bg-indigo-500 text-white' : 'text-slate-400 hover:text-slate-200' }"
							title="Mayor a menor"
						>
							<ArrowDown size={ 11 } />
							Desc
						</button>
					</div>

					{#if sortOrder !== 'original' }
						<button
							type="button"
							onclick={ resetSort }
							class="flex h-6 w-6 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-400 transition hover:bg-white/10 hover:text-white"
							title="Volver al orden original"
						>
							<RotateCcw size={ 12 } />
						</button>
					{/if}
				</div>
			</div>

			{#if drawn.length === 0 }
				<div class="grid h-64 place-items-center rounded-2xl border border-dashed border-white/10 text-center text-sm text-slate-500">
					Tu historial aparecerá<br />aquí al comenzar.
				</div>
			{:else}
				<div class="grid max-h-122 grid-cols-3 gap-2 overflow-y-auto pt-2 pr-1 sm:grid-cols-4 lg:grid-cols-3">
					{#each sortedDrawn as number, i ( `${ number }-${ i }` ) }
						<div
							class="group relative rounded-xl border py-3 text-center transition {
								currentNumber === number
									? 'border-teal-400/80 bg-teal-500/20 text-teal-200 shadow-[0_0_12px_rgba(45,212,191,0.3)]'
									: 'border-white/10 bg-white/5 text-slate-200 hover:border-indigo-300/40 hover:bg-indigo-400/10'
							}"
						>
							<span class="text-lg font-black">{ number }</span>

							{#if sortOrder === 'original' && i === 0 }
								<span class="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-teal-300 shadow-[0_0_10px_#5eead4]"></span>
							{/if}
						</div>
					{/each}
				</div>
			{/if}
		</div>
	{/if}
</aside>
