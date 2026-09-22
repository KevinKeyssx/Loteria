<script lang="ts">
	import type { ISwitchProps } from '../../types/switch';

	let {
		checked		= $bindable( false ),
		disabled	= false,
		id,
		name,
		label		= 'Interruptor',
		onchange
	}: ISwitchProps = $props();

	function toggle(): void {
		if ( disabled ) {
			return;
		}
		checked = !checked;
		onchange?.( checked );
	}
</script>

<button
	type="button"
	role="switch"
	aria-checked={ checked }
	aria-label={ label }
	{ id }
	{ name }
	{ disabled }
	onclick={ toggle }
	class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-300/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080d1d] disabled:cursor-not-allowed disabled:opacity-40 { checked ? 'bg-teal-400' : 'bg-slate-700' }"
>
	<span
		aria-hidden="true"
		class="pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-md ring-0 transition-transform duration-200 ease-out { checked ? 'translate-x-6' : 'translate-x-1' }"
	></span>
</button>
