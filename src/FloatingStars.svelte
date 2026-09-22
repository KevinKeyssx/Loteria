<script lang="ts">
	import type { IStarParticle } from './types/game';

	const particles: IStarParticle[] = [
		{
			id				: 1,
			left			: 12,
			top				: 26,
			size			: 16,
			delay			: 0,
			duration		: 4.2,
			color			: '#5eead4',
			type			: 'star',
			glow			: 'rgba(94, 234, 212, 0.7)'
		},
		{
			id				: 2,
			left			: 84,
			top				: 22,
			size			: 17,
			delay			: 0.6,
			duration		: 4.8,
			color			: '#fde047',
			type			: 'star',
			glow			: 'rgba(253, 224, 71, 0.7)'
		},
		{
			id				: 3,
			left			: 22,
			top				: 65,
			size			: 13,
			delay			: 1.2,
			duration		: 3.8,
			color			: '#ffffff',
			type			: 'star',
			glow			: 'rgba(255, 255, 255, 0.8)'
		},
		{
			id				: 4,
			left			: 76,
			top				: 68,
			size			: 15,
			delay			: 1.8,
			duration		: 4.5,
			color			: '#38bdf8',
			type			: 'star',
			glow			: 'rgba(56, 189, 248, 0.7)'
		},
		{
			id				: 5,
			left			: 29,
			top				: 16,
			size			: 12,
			delay			: 2.3,
			duration		: 3.9,
			color			: '#fef08a',
			type			: 'star',
			glow			: 'rgba(254, 240, 138, 0.7)'
		},
		{
			id				: 6,
			left			: 68,
			top				: 15,
			size			: 14,
			delay			: 0.3,
			duration		: 4.1,
			color			: '#5eead4',
			type			: 'star',
			glow			: 'rgba(94, 234, 212, 0.7)'
		},
		{
			id				: 7,
			left			: 16,
			top				: 45,
			size			: 11,
			delay			: 2.8,
			duration		: 5.0,
			color			: '#c4b5fd',
			type			: 'star',
			glow			: 'rgba(196, 181, 253, 0.7)'
		},
		{
			id				: 8,
			left			: 88,
			top				: 52,
			size			: 14,
			delay			: 1.5,
			duration		: 4.6,
			color			: '#fde047',
			type			: 'star',
			glow			: 'rgba(253, 224, 71, 0.7)'
		},
		{
			id				: 9,
			left			: 8,
			top				: 72,
			size			: 5,
			delay			: 0.2,
			duration		: 3.5,
			color			: '#5eead4',
			type			: 'dot',
			glow			: 'rgba(94, 234, 212, 0.9)'
		},
		{
			id				: 10,
			left			: 92,
			top				: 38,
			size			: 4,
			delay			: 0.9,
			duration		: 4.0,
			color			: '#ffffff',
			type			: 'dot',
			glow			: 'rgba(255, 255, 255, 0.9)'
		},
		{
			id				: 11,
			left			: 26,
			top				: 35,
			size			: 4,
			delay			: 1.7,
			duration		: 3.6,
			color			: '#fde047',
			type			: 'dot',
			glow			: 'rgba(253, 224, 71, 0.9)'
		},
		{
			id				: 12,
			left			: 72,
			top				: 42,
			size			: 5,
			delay			: 2.5,
			duration		: 4.3,
			color			: '#38bdf8',
			type			: 'dot',
			glow			: 'rgba(56, 189, 248, 0.9)'
		},
		{
			id				: 13,
			left			: 38,
			top				: 78,
			size			: 4,
			delay			: 0.4,
			duration		: 3.7,
			color			: '#ffffff',
			type			: 'dot',
			glow			: 'rgba(255, 255, 255, 0.9)'
		},
		{
			id				: 14,
			left			: 62,
			top				: 80,
			size			: 4,
			delay			: 2.1,
			duration		: 4.4,
			color			: '#5eead4',
			type			: 'dot',
			glow			: 'rgba(94, 234, 212, 0.9)'
		},
		{
			id				: 15,
			left			: 48,
			top				: 12,
			size			: 10,
			delay			: 1.0,
			duration		: 4.7,
			color			: '#fef08a',
			type			: 'star',
			glow			: 'rgba(254, 240, 138, 0.7)'
		},
		{
			id				: 16,
			left			: 52,
			top				: 84,
			size			: 12,
			delay			: 2.9,
			duration		: 3.9,
			color			: '#38bdf8',
			type			: 'star',
			glow			: 'rgba(56, 189, 248, 0.7)'
		}
	];
</script>

<div class="stars-layer pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
	<div class="stars-radial-aura"></div>
	{#each particles as p ( p.id )}
		<div
			class="star-item { p.type === 'star' ? 'star-sparkle' : 'star-dot' }"
			style="left: { p.left }%; top: { p.top }%; animation-delay: { p.delay }s; animation-duration: { p.duration }s;"
		>
			{#if p.type === 'star' }
				<svg
					viewBox="0 0 24 24"
					width={ p.size }
					height={ p.size }
					fill={ p.color }
					style="filter: drop-shadow(0 0 6px { p.glow });"
				>
					<path d="M12 0 C12 6.627 17.373 12 24 12 C17.373 12 12 17.373 12 24 C12 17.373 6.627 12 0 12 C6.627 12 12 6.627 12 0 Z" />
				</svg>
			{:else}
				<span
					class="dot-shape"
					style="width: { p.size }px; height: { p.size }px; background-color: { p.color }; box-shadow: 0 0 8px { p.glow };"
				></span>
			{/if}
		</div>
	{/each}
</div>

<style>
	.stars-layer {
		position: absolute;
		inset: 0;
		overflow: hidden;
		pointer-events: none;
		z-index: 1;
	}

	.stars-radial-aura {
		position: absolute;
		left: 50%;
		top: 50%;
		width: 280px;
		height: 280px;
		transform: translate(-50%, -50%);
		border-radius: 9999px;
		background: radial-gradient(circle, rgba(94, 234, 212, 0.14) 0%, rgba(99, 102, 241, 0.08) 45%, transparent 70%);
		filter: blur(20px);
		animation: aura-pulse 4s ease-in-out infinite;
	}

	.star-item {
		position: absolute;
		display: flex;
		align-items: center;
		justify-content: center;
		will-change: transform, opacity;
	}

	.star-sparkle {
		animation: star-float-glow 4s ease-in-out infinite;
	}

	.star-dot {
		animation: dot-float-glow 3.8s ease-in-out infinite;
	}

	.dot-shape {
		display: block;
		border-radius: 9999px;
	}

	@keyframes star-float-glow {
		0% {
			transform: translateY(18px) translateX(0) scale(0.65) rotate(0deg);
			opacity: 0;
		}
		20% {
			opacity: 0.95;
			transform: translateY(6px) translateX(-4px) scale(1) rotate(6deg);
		}
		50% {
			opacity: 0.45;
			transform: translateY(-12px) translateX(4px) scale(0.85) rotate(-6deg);
		}
		80% {
			opacity: 1;
			transform: translateY(-28px) translateX(-2px) scale(1.15) rotate(10deg);
		}
		100% {
			transform: translateY(-46px) translateX(0) scale(0.5) rotate(15deg);
			opacity: 0;
		}
	}

	@keyframes dot-float-glow {
		0% {
			transform: translateY(14px) translateX(0) scale(0.6);
			opacity: 0;
		}
		25% {
			opacity: 0.85;
			transform: translateY(2px) translateX(3px) scale(1.1);
		}
		60% {
			opacity: 0.35;
			transform: translateY(-16px) translateX(-3px) scale(0.8);
		}
		85% {
			opacity: 0.95;
			transform: translateY(-30px) translateX(2px) scale(1.15);
		}
		100% {
			transform: translateY(-44px) translateX(0) scale(0.4);
			opacity: 0;
		}
	}

	@keyframes aura-pulse {
		0%, 100% {
			opacity: 0.45;
			transform: translate(-50%, -50%) scale(0.92);
		}
		50% {
			opacity: 0.85;
			transform: translate(-50%, -50%) scale(1.08);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.star-sparkle,
		.star-dot,
		.stars-radial-aura {
			animation: none;
			opacity: 0.6;
		}
	}
</style>
