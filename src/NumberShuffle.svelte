<script lang="ts">
	import { Shuffle, Sparkles } from 'lucide-svelte';
	import type { INumberShuffleProps } from './types/game';

	let { start = 1, end = 90 }: INumberShuffleProps = $props();
	let rollingNumber: number = $state( 1 );

	$effect(() => {
		const range: number = Math.max( 1, end - start + 1 );
		const interval: ReturnType<typeof setInterval> = setInterval(() => {
			rollingNumber = start + Math.floor( Math.random() * range );
		}, 75 );

		return () => clearInterval( interval );
	});
</script>

<div class="shuffle-stage" role="status" aria-live="polite" aria-label="Buscando un número al azar">
	<div class="shuffle-orbit orbit-one"></div>
	<div class="shuffle-orbit orbit-two"></div>
	<div class="shuffle-spark spark-one"><Sparkles size={ 16 } fill="currentColor" /></div>
	<div class="shuffle-spark spark-two"><Sparkles size={ 11 } fill="currentColor" /></div>
	<div class="shuffle-icon"><Shuffle size={ 18 } /></div>
	<div class="shuffle-number number-glow">{ rollingNumber }</div>
	<div class="shuffle-dots" aria-hidden="true"><span></span><span></span><span></span></div>
	<p class="shuffle-label">Buscando tu número</p>
</div>
