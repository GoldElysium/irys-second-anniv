<script lang="ts">
	import SimpleImageGallery from '$lib/components/SimpleImageGallery.svelte';
	import LexicalRenderer from '$lib/components/LexicalRenderer.svelte';
	import TitleLink from '$lib/components/TitleLink.svelte';
	import { TIMELINE_ID_PREFIX, toDomId } from '$lib/js/timelineContentLink';
	import type { TimelineData, YearlyTimelineData } from '$lib/types/Types';
	import type { Readable } from 'svelte/store';

	export let years: YearlyTimelineData[];
	export let intersectingEvents: Record<string, boolean>;
	export let diamondY: number;
	export let currentYear: number;
	export let src: string;
	export let showConfettiElements: Set<string>;
	export let prefersReducedMotion: Readable<boolean>;

	let timelineItemObserver: IntersectionObserver;
	let confettiObserver: IntersectionObserver;
	let confettiElements: Map<string, boolean> = new Map();
	let throttling = false;
	let validBackgroundElements: Set<string> = new Set();

	const yearElements: Record<number, HTMLElement> = {};
	const revealSections: Record<string, HTMLElement> = {};

	$: idFromEvent = new Map(years.flatMap((year) => year.events).map((event) => [event.id, event]));

	/* Reference https://alvarotrigo.com/blog/css-animations-scroll/*/
	function reveal() {
		for (const [sectionId, revealSection] of Object.entries(revealSections)) {
			const revealSectionTop = revealSection.getBoundingClientRect().top;
			const revealSectionVisible = 150;

			if (revealSectionTop < innerHeight - revealSectionVisible) {
				revealSection.classList.add('active');

				if (confettiElements.get(sectionId)) {
					showConfettiElements.add(sectionId);
				}
			} else {
				revealSection.classList.remove('active');

				if (confettiElements.has(sectionId)) {
					showConfettiElements.delete(sectionId);
				}
			}
		}

		showConfettiElements = showConfettiElements;
	}

	// https://stackoverflow.com/a/3552493
	function formatDate(date: Date) {
		const ye = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(date);
		const mo = new Intl.DateTimeFormat('en', { month: 'long' }).format(date);
		const da = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(date);
		return `${mo} ${da}, ${ye}`;
	}

	function timelineTimeObserverAction(item: HTMLElement) {
		timelineItemObserver ??= new IntersectionObserver(timelineItemObserverCallback, {
			threshold: 0.4
		});

		timelineItemObserver.observe(item);

		return {
			destroy() {
				timelineItemObserver.unobserve(item);
			}
		};
	}

	function timelineItemObserverCallback(entries: IntersectionObserverEntry[]) {
		const intersectingMap: Record<string, boolean> = {
			...intersectingEvents
		};

		const sortedEntries = entries.sort((a, b) => {
			const aTop = a.target.getBoundingClientRect().top;
			const bTop = b.target.getBoundingClientRect().top;

			return aTop - bTop;
		});

		sortedEntries.forEach((entry) => {
			const eventId = getEventIdFromObserverEntry(entry);
			const event = idFromEvent.get(eventId);
			const isIntersecting = entry.isIntersecting;

			updateBackground(event, isIntersecting);

			intersectingMap[eventId] = isIntersecting;
		});

		intersectingEvents = intersectingMap;
	}

	function extractBackgroundImage(event: TimelineData | undefined): string | undefined {
		if (event?.background_image) {
			return event.background_image.src;
		} else if (event?.images && event.images.length > 0) {
			return event?.images[0].src;
		} else {
			return undefined;
		}
	}

	function updateBackground(event: TimelineData | undefined, isEntering: boolean) {
		if ($prefersReducedMotion) {
			return;
		}

		let val = extractBackgroundImage(event);

		if (val) {
			if (isEntering) {
				validBackgroundElements.add(val);
			} else {
				validBackgroundElements.delete(val);
			}
		}

		if (validBackgroundElements.size > 0) {
			const newSrc = [...validBackgroundElements][0];
			if (newSrc) {
				src = newSrc;
			}
		}
	}

	function getEventIdFromObserverEntry(entry: IntersectionObserverEntry): string {
		return entry.target.id.replace(TIMELINE_ID_PREFIX, '');
	}

	function useConfetti(item: TimelineData) {
		return item.vfx === 'confetti';
	}

	function initBackgroundImage(element: HTMLElement, event: TimelineData) {
		const rect = element.getBoundingClientRect();
		const viewHeight = Math.max(document.documentElement.clientHeight, window.innerHeight);
		const isInBounds = !(rect.bottom < 0 || rect.top - viewHeight >= 0);

		if (isInBounds && !$prefersReducedMotion) {
			let val = extractBackgroundImage(event);
			if (val) {
				validBackgroundElements.add(val);
				src = val;
			}
		}
	}

	function confettiTagger(item: HTMLElement, enabled: boolean) {
		if (enabled) {
			confettiObserver ??= new IntersectionObserver(confettiObserverCallback, {
				threshold: 0
			});
			confettiObserver.observe(item);

			confettiElements.set(item.id.replace(TIMELINE_ID_PREFIX, ''), false);

			return {
				destroy() {
					confettiObserver.unobserve(item);
				}
			};
		}
	}

	function confettiObserverCallback(entries: IntersectionObserverEntry[]) {
		entries.forEach((entry) => {
			const eventId = entry.target.id.replace(TIMELINE_ID_PREFIX, '');
			if (entry.isIntersecting) {
				confettiElements.set(eventId, true);
			} else {
				showConfettiElements.delete(eventId);
				confettiElements.set(eventId, false);
			}
		});

		showConfettiElements = showConfettiElements;
	}

	function handleScroll() {
		if (throttling) {
			return;
		}

		requestAnimationFrame(() => {
			reveal();
			checkYear();
			checkDiamond();
			throttling = false;
		});
		throttling = true;
	}

	function checkYear() {
		// For the foldout to adjust the height based on whether the header collapses
		let newYear = currentYear;

		for (let i = 0; i < years.length; i++) {
			const year = years[i];
			const nextYear = years[i + 1];
			const element1 = yearElements[year.year].getBoundingClientRect().top;
			const element2: number | undefined =
				yearElements[nextYear?.year]?.getBoundingClientRect().top;
			const element1ScrollY = element1 + scrollY;
			const element2ScrollY = (element2 ?? 0) + scrollY;
			const bottomOfScreen = scrollY + innerHeight / 1.25;

			if (element2 && bottomOfScreen > element1ScrollY && scrollY < element2ScrollY) {
				newYear = year.year;
			}
			// For the last year
			else if (bottomOfScreen > element1ScrollY && typeof element2 === 'undefined') {
				newYear = years[years.length - 1].year;
			}
		}

		currentYear = newYear;
	}

	function checkDiamond() {
		const intersectingEventsArray = Object.entries(intersectingEvents)
			.filter(([, intersecting]) => intersecting)
			.map(([id]) => {
				const element = revealSections[id];
				return { rect: element.getBoundingClientRect(), id };
			});

		if (intersectingEventsArray.length === 0) {
			return;
		}

		const topThird = innerHeight / 3;
		const lastOnTop = intersectingEventsArray
			.filter(({ rect }) => rect.top < topThird)
			.sort((a, b) => b.rect.top - a.rect.top)[0];
		if (lastOnTop == null) {
			return;
		}
		const year = years.find((year) => year.year === currentYear);
		if (!year?.events.length) {
			return;
		}
		const index = year.events.findIndex((event) => event.id === lastOnTop.id);
		const eventPercent = index > 0 ? (index / year.events.length) * 100 : 0;
		const progressWithinEvent = Math.min(
			100,
			((topThird - lastOnTop.rect.top) / lastOnTop.rect.height) * 100
		);

		diamondY = Math.max(0, eventPercent + progressWithinEvent / year.events.length);
	}
</script>

<svelte:window on:scroll={handleScroll} />

<section class="timeline">
	{#each years as year}
		<section class="year-divider" bind:this={yearElements[year.year]}>
			<p class="year-css" id={toDomId(year.id)}>
				{year.year}
			</p>
			{#each year.events as item}
				<section class="timeline-section reveal-section active" bind:this={revealSections[item.id]}>
					<div
						class="timeline-item"
						id={toDomId(item.id)}
						use:timelineTimeObserverAction
						use:initBackgroundImage={item}
						use:confettiTagger={useConfetti(item)}
					>
						<div class="timeline-extra">
							<div class="date">{formatDate(item.date)}</div>
							<TitleLink href="#{toDomId(item.id)}">
								<h2>{item.title}</h2>
							</TitleLink>
							<div class="milestone-content">
								<LexicalRenderer nodes={item.content.root.children} />
							</div>
						</div>
						<div class="timeline-img-container">
							<SimpleImageGallery images={item.images} />
						</div>
					</div>
				</section>
			{/each}
		</section>
		<div class="extra-space">
			{#if year.year === years[years.length - 1].year}
				<div class="year-end">Her journey continues...</div>
			{:else}
				<div class="year-end">End of {year.year}</div>
			{/if}
		</div>
	{/each}
	<div />
</section>

<!-- Reference from https://www.youtube.com/watch?v=TcYSRI1JFQE -->

<style>
	.timeline {
		margin: 1rem;
		padding: 0 20px 0 30px;
	}
	.year-divider {
		display: grid;
		grid-template-columns: 1fr;
		height: auto;
		gap: 14vh;
	}
	.year-css {
		display: flex;
		width: auto;
		position: relative;
		color: #ddd;
		font-size: 2em;
		padding-bottom: 20px;
		align-items: center;
		justify-content: center;
	}
	.year-css::before {
		content: '';
		display: block;
		width: 15%;
		height: 2px;
		background: #ddd;
		left: 20%;
		top: 50%;
		position: absolute;
	}
	.year-css::after {
		content: '';
		display: block;
		width: 15%;
		height: 2px;
		background: #ddd;
		right: 20%;
		top: 50%;
		position: absolute;
	}
	.timeline-section {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		height: 100%;
	}
	/* Line for the timeline      border-left: 2px solid #ccc;  */
	.reveal-section {
		position: relative;
		transform: translateY(100px);
		opacity: 0;
		transition: 1s all ease;
	}
	.active {
		transform: translateY(0);
		opacity: 1;
	}
	.timeline-item {
		display: grid;
		grid-template-columns: 1fr;
		background-color: rgba(0, 0, 0, 0.5);
		padding: 1rem 0.75rem;
		border-radius: 50px;
		position: relative;
		height: auto;
		margin: 0px 0px 100px 20px;
		line-height: 1.5;
		justify-items: left;
		z-index: 10;
	}

	.timeline-extra {
		margin: 3px;
		color: white;
	}
	.extra-space {
		display: flex;
		color: #ddd;
		width: auto;
		height: 450px;
		align-items: center;
		justify-content: center;
	}
	.year-end {
		position: relative;
		text-align: center;
		width: 50%;
	}
	.year-end::before {
		content: '';
		display: block;
		width: 15%;
		height: 2px;
		background: #ddd;
		left: -20%;
		top: 50%;
		position: absolute;
	}
	.year-end::after {
		content: '';
		display: block;
		width: 15%;
		height: 2px;
		background: #ddd;
		right: -20%;
		top: 50%;
		position: absolute;
	}
	/* Dot beside the timeline
.timeline-item::before{
    content: '';
    display: block;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: #000;
    border: 3px solid #ddd;
    position:absolute;
    left: -39px;
}*/
	h2,
	.year-end {
		font-size: 1.3rem;
		margin: 10px;
		text-transform: uppercase;
	}
	.date {
		margin: 10px;
		font-weight: lighter;
		font-size: 1.2rem;
	}
	p {
		margin: 0;
		padding: 10px 0px;
		font-size: medium;
	}
	/*https://stackoverflow.com/questions/1165497/how-to-prevent-text-from-overflowing-in-css*/
	.milestone-content {
		margin: 10px;
		word-wrap: break-word;
		/*white-space: pre-wrap; (Seems to add more whitespace below the link)*/
		word-break: break-word;
	}

	@media (min-width: 320px) {
		.timeline {
			margin: 0px 10px 0px 40px;
			padding: 30px 5px 0px 20px;
		}
		.extra-space {
			height: 100px;
		}
		.year-css::before {
			width: 20%;
			left: 10%;
		}
		.year-css::after {
			width: 20%;
			right: 10%;
		}
		.year-end::before {
			width: 25%;
			left: -30%;
		}
		.year-end::after {
			width: 25%;
			right: -30%;
		}
	}
	@media (min-width: 481px) {
		.timeline {
			margin: 0px 20px 0px 40px;
			padding: 50px 20px 0px 30px;
		}
		.extra-space {
			margin-left: 10px;
			height: 250px;
		}
		.year-css::before {
			width: 25%;
			left: 4%;
		}
		.year-css::after {
			width: 25%;
			right: 4%;
		}
		.year-end::before {
			width: 30%;
			left: -50%;
		}
		.year-end::after {
			width: 30%;
			right: -50%;
		}

		.year-end,
		h2 {
			font-size: 1.7em;
		}
	}
	@media (min-width: 769px) {
		.timeline {
			margin: 0px 0px 0px 135px;
			padding: 50px 30px 0px 30px;
		}
		.extra-space {
			margin-left: 10px;
			height: 350px;
		}
		.timeline-extra {
			padding: 20px;
			margin: 10px;
		}

		.timeline-item {
			padding: 20px 25px;
		}

		h2,
		.year-end {
			font-size: 2em;
		}

		.date {
			font-size: 1.5em;
		}
		.year-css::before {
			width: 25%;
			left: 5%;
		}
		.year-css::after {
			width: 25%;
			right: 5%;
		}
		.year-end::before {
			right: 20px;
			width: 40%;
			left: -50%;
		}
		.year-end::after {
			width: 40%;
			right: -50%;
		}
	}

	@media (min-width: 1024px) {
		.timeline {
			margin: 0px 10px 0px 100px;
			padding: 50px 10px 0px 60px;
		}

		.timeline-item {
			grid-template-columns: 3fr 2fr;
			margin-right: 5em;
		}

		.timeline-img-container {
			margin: auto 1rem;
		}
		.extra-space {
			height: 450px;
		}
	}

	@media (min-width: 1400px) {
		.timeline {
			margin-left: 200px;
		}

		.timeline-img-container {
			margin: auto 2rem;
		}
		.extra-space {
			margin-left: 0px;
			margin-right: 90px;
		}
		.year-css {
			margin-right: 100px;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.reveal-section {
			transition: 1s opacity ease;
		}
	}

	/** TODO: considering adding dark mode and make timeline-item black  */
</style>
