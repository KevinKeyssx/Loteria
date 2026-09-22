<script lang="ts">
	import { onDestroy } from 'svelte';
	import { Minus, Plus } from 'lucide-svelte';
	import type { INumberProps } from '../../types/number';

	let {
		value		= $bindable( 1 ),
		min,
		max,
		step		= 1,
		disabled	= false,
		id,
		name,
		placeholder,
		onchange
	}: INumberProps = $props();

	let holdTimer: ReturnType<typeof setTimeout> | null = null;
	let repeatTimer: ReturnType<typeof setTimeout> | null = null;
	let isHolding: boolean = false;

	function clamp( n: number ): number {
		let res: number = n;
		if ( min !== undefined && res < min ) {
			res = min;
		}
		if ( max !== undefined && res > max ) {
			res = max;
		}
		return res;
	}

	function updateValue( delta: number ): void {
		if ( disabled ) {
			return;
		}
		const current: number = Number( value ?? 0 );
		const next: number = clamp( current + delta );
		if ( next !== value ) {
			value = next;
			onchange?.( next );
		}
	}

	function startHold( delta: number, event: PointerEvent ): void {
		if ( disabled || event.button !== 0 ) {
			return;
		}
		event.preventDefault();
		stopHold();
		isHolding = true;
		updateValue( delta );

		let intervalMs: number = 130;

		function scheduleTick(): void {
			repeatTimer = setTimeout(() => {
				if ( !isHolding ) {
					return;
				}
				updateValue( delta );
				intervalMs = Math.max( 25, intervalMs - 12 );
				scheduleTick();
			}, intervalMs );
		}

		holdTimer = setTimeout(() => {
			if ( isHolding ) {
				scheduleTick();
			}
		}, 320 );
	}

	function stopHold(): void {
		isHolding = false;
		if ( holdTimer ) {
			clearTimeout( holdTimer );
			holdTimer = null;
		}
		if ( repeatTimer ) {
			clearTimeout( repeatTimer );
			repeatTimer = null;
		}
	}

	function handleInput( event: Event ): void {
		const target: HTMLInputElement = event.target as HTMLInputElement;
		const raw: number = parseInt( target.value, 10 );
		if ( isNaN( raw ) ) {
			return;
		}
		const clamped: number = clamp( raw );
		value = clamped;
		onchange?.( clamped );
	}

	function handleKeyDown( delta: number, event: KeyboardEvent ): void {
		if ( event.key === 'Enter' || event.key === ' ' ) {
			event.preventDefault();
			updateValue( delta );
		}
	}

	onDestroy(() => {
		stopHold();
	});
</script>

<div class="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-1.5 transition-colors focus-within:border-indigo-400 { disabled ? 'opacity-50' : 'hover:border-white/20' }">
	<button
		type="button"
		class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-300 transition-colors select-none hover:bg-white/10 hover:text-white active:bg-white/20 disabled:cursor-not-allowed disabled:opacity-30"
		disabled={ disabled || ( min !== undefined && value !== undefined && value <= min ) }
		aria-label="Disminuir"
		onpointerdown={ ( e: PointerEvent ) => startHold( -step, e ) }
		onpointerup={ stopHold }
		onpointerleave={ stopHold }
		onpointercancel={ stopHold }
		onkeydown={ ( e: KeyboardEvent ) => handleKeyDown( -step, e ) }
		onclick={ ( e: MouseEvent ) => e.preventDefault() }
	>
		<Minus size={ 16 } />
	</button>

	<input
		type="number"
		bind:value
		{ min }
		{ max }
		{ step }
		{ disabled }
		{ id }
		{ name }
		{ placeholder }
		oninput={ handleInput }
		class="number-no-spinners w-full bg-transparent px-2 py-1 text-center font-bold text-white outline-none"
	/>

	<button
		type="button"
		class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-300 transition-colors select-none hover:bg-white/10 hover:text-white active:bg-white/20 disabled:cursor-not-allowed disabled:opacity-30"
		disabled={ disabled || ( max !== undefined && value !== undefined && value >= max ) }
		aria-label="Aumentar"
		onpointerdown={ ( e: PointerEvent ) => startHold( step, e ) }
		onpointerup={ stopHold }
		onpointerleave={ stopHold }
		onpointercancel={ stopHold }
		onkeydown={ ( e: KeyboardEvent ) => handleKeyDown( step, e ) }
		onclick={ ( e: MouseEvent ) => e.preventDefault() }
	>
		<Plus size={ 16 } />
	</button>
</div>

<style>
	.number-no-spinners::-webkit-outer-spin-button,
	.number-no-spinners::-webkit-inner-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}

	.number-no-spinners {
		-moz-appearance: textfield;
		appearance: textfield;
	}
</style>
