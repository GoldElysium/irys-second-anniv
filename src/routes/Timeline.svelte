<script lang="ts">
	import type { YearlyTimelineData } from '$lib/types/Types';
	import { getGlobalStore } from '$lib/js/globalStore';
	import Diamond from '$lib/components/DiamondIcon.svelte';
	import { toDomId } from '$lib/js/timelineContentLink';
	import { tick } from 'svelte';
	import { modalAction } from '$lib/js/modalAction';

	export let years: YearlyTimelineData[];
	export let intersectingEvents: Record<string, boolean>;
	/* For the diamond to move about*/
	export let diamondY: number;
	export let currentYear = years[0].year;

	let foldoutOpen = false;
	let scrollY = 0;
	const globalStore = getGlobalStore();
	const foldoutEventElements: Record<string, HTMLElement> = {};

	function handleFoldoutOpen() {
		foldoutOpen = true;
		tick().then(scrollFoldoutEvent);
	}

	function handleMenuClose() {
		foldoutOpen = false;
	}

	/**
	 * Allows the user to scroll into the timeline content on click.
	 * @param id
	 */
	function scrollToElement(id: string) {
		foldoutOpen = false;
		const element = document.getElementById(id);
		moveFocusNavigationStartPoint(element?.querySelector('a'));
		element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
	}
	function scrollToYear(id: string) {
		const element = document.getElementById(id);
		moveFocusNavigationStartPoint(element?.querySelector('a'));
		element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
	}

	function moveFocusNavigationStartPoint(ele: HTMLElement | null | undefined) {
		ele?.focus({ preventScroll: true });
		ele?.blur();
	}

	function scrollFoldoutEvent() {
		const intersectingEvent = Object.entries(intersectingEvents).find(
			([, intersecting]) => intersecting
		);

		if (!intersectingEvent) {
			return;
		}
		const [id] = intersectingEvent;
		foldoutEventElements[id].scrollIntoView();
	}

	function scrollToEventsIfNotAlready() {
		if(scrollY < $globalStore.heroHeight) scrollTo({ top: $globalStore.heroHeight + 10 });
	}
</script>

<!--Might be bad practice-->
<svelte:window bind:scrollY />

<button
	type="button"
	class="toggle"
	class:active={foldoutOpen}
	class:display={scrollY > $globalStore.heroHeight}
	on:focus={scrollToEventsIfNotAlready}
	on:click|stopPropagation={handleFoldoutOpen}
>
	<span class="arrow glow" class:hide={$globalStore.navLinksVisible} id="toggle_button">&#8250</span
	>
</button>
<div class="modal-container" class:active={foldoutOpen}>
	<div
		class="foldout"
		class:active={foldoutOpen}
		style:top="{$globalStore.headerHeight}px"
		use:modalAction={{ show: foldoutOpen }}
		on:close-modal={handleMenuClose}
	>
		{#each years as { year, events }}
			<section class="foldout-wrapper">
				<h2 class="foldout-year">{year}</h2>
				{#each events as content}
					{@const target = toDomId(content.id)}
					<a
						class="foldout-content"
						class:active={intersectingEvents[content.id]}
						bind:this={foldoutEventElements[content.id]}
						id="foldout-content{content.id}"
						href="#{target}"
						tabindex={foldoutOpen ? undefined : -1}
						on:click|preventDefault={() => scrollToElement(target)}
					>
						<p class="content-title" tabindex="-1">{content.title}</p>
					</a>
				{/each}
			</section>
		{/each}
	</div>
</div>

<div class="sidebar" class:active={foldoutOpen} class:display={scrollY > $globalStore.heroHeight}>
	<div class="wrapper">
		{#each years as { year, events, id }}
			{@const yearTarget = toDomId(id)}
			<div class="year" id="x">
				<a
					class="year-link"
					href="#{yearTarget}"
					on:click|preventDefault={() => scrollToYear(yearTarget)}
				>
					<p class="year-num" class:active={currentYear === year}>
						<span class="year-num-mobile">{year}</span>
						<span class="year-num-large">{year}</span>
					</p>
				</a>

				<div class="links" class:active={currentYear === year}>
					{#if year === currentYear}
						<span class="diamond" style:top="calc({diamondY}% - 2px)">
							<Diamond />
						</span>

						{#each events as content}
							{@const target = toDomId(content.id)}
							<div class="get-tabled">
								<a
									class="content-jump"
									class:active={intersectingEvents[content.id]}
									bind:this={foldoutEventElements[content.id]}
									id="foldout-content{content.id}"
									href="#{target}"
									on:focus={scrollToEventsIfNotAlready}
									on:click|preventDefault={() => scrollToElement(target)}
								>
									<p class="tooltip"><span>{content.title}</span></p>
								</a>
							</div>
						{/each}
					{/if}
				</div>
			</div>
		{/each}
		<div class="last-circle" />
	</div>
</div>

<!-- Reference https://www.youtube.com/watch?v=BHskAsXVey8 -->
<!-- Glow Reference https://www.w3schools.com/howto/howto_css_glowing_text.asp-->
<style>
	.toggle {
		opacity: 0;
		position: fixed;
		top: 40%;
		left: 0px;
		height: auto;
		background: transparent;
		cursor: pointer;
		transition: 0.2s;
		z-index: 300;
		border: none;
		padding: 0;
	}
	.toggle.active {
		transform: translateX(-30px);
	}
	.toggle.display {
		opacity: 1;
		transition: 500ms ease-in-out;
	}
	.toggle:focus {
		outline: none;
		box-shadow: 2px 0px 10px 0px var(--dark-pink);
	}
	.arrow {
		background: transparent;
		border: none;
		padding-left: 0.5rem;
	}
	.arrow.hide {
		display: none;
	}
	.glow {
		font-size: 50px;
		color: #fff;
		text-align: center;
		animation: glow 1s ease-in-out infinite alternate;
	}
	@keyframes glow {
		from {
			text-shadow: 0 0 10px #fff, 0 0 20px #fff, 0 0 30px #e60073, 0 0 40px #e60073,
				0 0 50px #e60073, 0 0 60px #e60073, 0 0 70px #e60073;
		}

		to {
			text-shadow: 0 0 20px #fff, 0 0 30px #ff4da6, 0 0 40px #ff4da6, 0 0 50px #ff4da6,
				0 0 60px #ff4da6, 0 0 70px #ff4da6, 0 0 80px #ff4da6;
		}
	}
	.modal-container {
		position: fixed;
		top: 0;
		right: 0;
		bottom: 0;
		left: 0;
		z-index: 500;
		width: auto;
		display: flex;
		transform: translateX(-10000px);
		background-color: rgba(0, 0, 0, 0.7);
		transition: transform 0.5s, top 0.15s;
	}
	.modal-container.active {
		transform: translateX(0px);
		transition: 500ms ease-in-out;
	}
	.foldout {
		position: fixed;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		width: 250px;
		height: 100vh; /*Fallback for some devices*/
		height: 100svh;
		transform: translateX(-300px);
		z-index: 1001;
		transition: transform 0.5s, top 0.15s;
	}
	/*Styling Scrollbar for Firefox*/
	.foldout.active {
		transform: translateX(0px);
		overflow: auto;
		-webkit-overflow-scrolling: touch;
		touch-action: pan-y;
		scrollbar-width: thin;
		scrollbar-color: #f1f1f1 #e5e5e5;
	}
	/*Styling Scrollbar For Chrome, Edge and Safari*/
	.foldout::-webkit-scrollbar {
		-webkit-appearance: none;
	}
	.foldout::-webkit-scrollbar:vertical {
		width: 12px;
	}
	.foldout::-webkit-scrollbar-track {
		background: #140e0e;
	}
	.foldout::-webkit-scrollbar-thumb {
		background-color: #ebebeb;
		border-radius: 20px;
		border: 2px solid #d1cfcf;
	}

	.foldout-year {
		margin: 0;
		padding: 8px;
		background-color: rgb(53, 53, 53);
		color: rgb(255, 255, 255);
	}
	.foldout-content {
		background: #212020;
		border: transparent;
		font-family: inherit;
		margin: 0;
		padding: 4px 15px;
		height: auto;
		width: 100%;
		display: inline-block;
		text-decoration: none;
		color: white;
		font-size: 0.83em;
		box-shadow: inset 0em -2px 4px #472140;
	}
	.foldout-content.active {
		background: #6d0551;
		color: white;
		transition: 0.3s;
		box-shadow: inset 0em 4px rgba(0, 0, 0, 0.2);
	}

	.foldout-content.active:hover {
		background: #ad0280;
	}
	.foldout-content:hover,
	.foldout-content:focus {
		background: #c04d83;
		cursor: pointer;
		transition: 0.5s;
	}

	.content-title {
		text-align: left;
		text-overflow: ellipsis;
		overflow-x: hidden;
		white-space: nowrap;
		height: auto;
		width: auto;
	}
	.year {
		border-left: 3px solid #ddd;
	}
	.year-link {
		text-decoration: none;
		-webkit-tap-highlight-color: transparent;
		-webkit-touch-callout: none;
		-webkit-user-select: none;
		-khtml-user-select: none;
		-moz-user-select: none;
		-ms-user-select: none;
		user-select: none;
	}
	.year-link:focus {
		outline: none;
	}
	.year-link:hover::before {
		width: 16px;
		height: 16px;
		left: -9px;
		border: 3px solid #c04d83;
		transition: all 500ms ease-in-out;
	}
	.links {
		transition: 750ms ease-out;
		display: table;
		table-layout: fixed;
		height: 0vh; /*Fallback for some devices*/
		height: 0svh;
		position: relative;
	}
	.links.active {
		height: 70vh; /*Fallback for some devices*/
		height: 70svh;
	}
	.get-tabled {
		display: table-row;
		position: relative;
	}
	.year .year-num {
		margin: inherit;
		padding: 5px 0px 0px 15px;
		color: #ddd;
		transform: translateX(0px);
	}
	.year .year-num-mobile {
		position: relative;
		left: -2.4rem;
		background-color: #fff;
		color: var(--dark-pink);
		padding: 2px 5px;
		border-radius: 0.5rem;
		font-size: 0.85rem;
		width: 2.7rem;
		text-align: center;
		display: inline-block;
	}
	.year .year-num-large {
		display: none;
		font-size: 1.2em;
	}
	.year-num.active {
		font-weight: bold;
	}
	/*		border-left: 2px solid #ccc;*/
	.sidebar {
		position: fixed;
		top: 80px;
		left: 300px;
		bottom: 0;
		margin: 0 0 0 18px;
		width: 18px;
		padding-top: 25px;
		transform: translateX(-250px);
		background: transparent;
		transition: all 500ms ease-in-out;
		z-index: 498;
		opacity: 0;
	}
	.sidebar.active {
		transform: translateX(-500px);
	}
	.sidebar.display {
		opacity: 1;
		transition: 500ms ease-in-out;
	}
	.diamond {
		top: 0px;
		color: #ddd;
		font-size: 32px;
		position: absolute;
		left: -10px;
		line-height: 1;
	}

	.sidebar .wrapper {
		width: 20px;
		height: 100%;
		background-color: transparent;
	}
	.sidebar .links {
		padding: 0px 0px;
	}
	.sidebar .links .content-jump {
		margin: 0px 0px;
		height: 25px;
		color: #888;
		display: flex;
		align-items: center;
		padding: 0px 12px;
		transition: all 300ms ease-in-out;
	}

	.content-jump {
		display: table-cell;
		vertical-align: middle;
		padding-left: 6px;
		transform: translateX(0px);
		/*https://stackoverflow.com/questions/21003535/anyway-to-prevent-the-blue-highlighting-of-elements-in-chrome-when-clicking-quic*/
		-webkit-tap-highlight-color: transparent;
		-webkit-touch-callout: none;
		-webkit-user-select: none;
		-khtml-user-select: none;
		-moz-user-select: none;
		-ms-user-select: none;
		user-select: none;
	}
	.content-jump::before {
		content: '';
		background: #e1cbd2;
		width: 0px;
		height: 3px;
		position: absolute;
		top: 50%;
		transform: translateY(-50%);
		left: 0;
	}
	.content-jump::after {
		content: '';
		display: block;
		width: 10px;
		height: 10px;
		border-radius: 50%;
		/*background-color: #b90b8c;*/
		background-color: #ddd;
		border: 3px solid #ddd;
		position: absolute;
		left: -9px;
	}
	.content-jump .tooltip {
		color: #ddd;
		filter: text-shadow(0px, 2px, 2px, rgba(0, 0, 0, 0.5));
		display: none;
		background-color: rgb(25, 25, 25, 0.8);
		padding: 0.5rem;
		border-radius: 0.5rem;
		left: 1rem;
		position: absolute;
	}

	.content-jump .tooltip span {
		text-overflow: ellipsis;
		min-width: 10em;
		max-width: 15em;
		display: inline-block;
		overflow: hidden;
	}

	.content-jump .tooltip::before {
		content: '';
		position: absolute;
		top: 50%;
		transform: translateY(-50%);
		border-top: 5px solid transparent;
		border-bottom: 5px solid transparent;
		border-right: 5px solid rgba(25, 25, 25, 0.8);
		left: -5px;
	}
	.content-jump:focus {
		outline: none;
	}
	.content-jump:hover {
		text-decoration: none;
	}
	.last-circle::before {
		content: '';
		background: #e1cbd2;
		width: 0px;
		height: 3px;
		position: absolute;
		top: 50%;
		transform: translateY(-50%);
		left: 1;
	}
	.last-circle::after {
		content: '';
		display: block;
		width: 11px;
		height: 11px;
		border-radius: 50%;
		/*background-color: #b90b8c;*/
		background-color: #ddd;
		position: absolute;
		left: -4px;
	}
	/* .content-jump.border {
		border-left: 3px solid #b90b8c;
		transition: all 500ms ease-in-out;
	} */
	.content-jump.active::after {
		background-color: #b90b8c;
		transition: all 500ms ease-in-out;
	}
	@media (min-width: 320px) {
		.content-title {
			font-size: 1.5em;
		}
		.sidebar {
			top: 60px;
			left: 285px;
		}
		.year-num.active {
			text-shadow: none;
		}
		.foldout {
			height: 100vh; /*Fallback for some devices*/
			height: 100svh;
		}
	}
	@media (min-width: 481px) {
		.content-title {
			font-size: 1.25em;
		}
	}
	@media (min-width: 769px) {
		.foldout {
			height: 95vh; /*Fallback for some devices*/
			height: 95svh;
			width: 200px;
		}
		.arrow.hide {
			display: inline-block;
		}
		.arrow {
			padding-left: 1rem;
		}

		.year .year-num-large {
			display: inline;
		}

		.sidebar {
			margin-left: 25px;
			left: 300px;
			top: 100px;
		}

		.year-link::before {
			content: '';
			display: block;
			width: 12px;
			height: 12px;
			border-radius: 50%;
			background-color: #ddd;
			border: 3px solid #ddd;
			position: absolute;
			left: -7px;
			transition: all 300ms ease-in-out;
		}

		.year-num.active {
			text-shadow: 1px 1px 8px #b90b8c;
		}

		.year .year-num-mobile {
			display: none;
		}
	}
	@media (min-width: 1024px) {
	}
	@media (min-width: 1400px) {
		.foldout {
			width: 250px;
		}
	}

	@media (hover: hover) and (pointer: fine) {
		.content-jump:hover .tooltip,
		.content-jump:focus .tooltip {
			white-space: nowrap;
			display: block;
		}

		.content-jump:hover::after {
			width: 14px;
			height: 14px;
			left: -11px;
			border: 3px solid #b90b8c;
			transition: all 500ms ease-in-out;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.sidebar .links .content-jump,
		.sidebar,
		.toggle,
		.glow,
		.links,
		.foldout {
			transition: none;
			animation: none;
		}
	}
</style>
