<script lang="ts">
	import Switch from './Switch.svelte';
	import type { ISwitcherProps } from '../../types/game';

	let {
		title,
		description,
		checked		= $bindable( false ),
		disabled	= false,
		id,
		name,
		onchange
	}: ISwitcherProps = $props();

	function toggle(): void {
		if ( disabled ) {
			return;
		}
		checked = !checked;
		onchange?.( checked );
	}
</script>

<div class="flex items-center justify-between rounded-xl border border-white/10 bg-white/3 p-4 transition-colors { disabled ? 'opacity-60' : 'hover:border-white/15' }">
	<button
		type="button"
		class="cursor-pointer pr-4 text-left select-none bg-transparent border-0 p-0 focus:outline-none"
		{ disabled }
		onclick={ toggle }
	>
		<span class="block text-sm font-bold text-slate-200">{ title }</span>
		{#if description }
			<span class="mt-1 block text-xs font-normal text-slate-400">{ description }</span>
		{/if}
	</button>
	<Switch
		bind:checked
		{ disabled }
		{ id }
		{ name }
		label={ title }
		{ onchange }
	/>
</div>
