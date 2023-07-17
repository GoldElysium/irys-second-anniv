<script>
	import { fade } from 'svelte/transition';
	import { fly } from 'svelte/transition';
	import { backOut } from 'svelte/easing';

	import Credits from './Credits.svelte';

	const imageTransitionFlyOffset = 16;
	const imageTransitionFlyDuration = 500;
	const imageAppearDuration = 400;

	const bodyDelayDuration = 300;
	const bodyAppearDuration = 400;

	const descriptionTransitionFlyOffset = 24;
	const descriptionTransitionFlyDuration = 500;

	const link_irys_discord = 'https://discord.gg/irystocrats';
	const link_holoenfans_discord = 'https://discord.gg/holoenfans';
	const link_irys = 'https://www.youtube.com/@IRyS';
</script>

<svelte:head>
	<title>About - AnniversaRyS 2023</title>
	<meta name="description" content="About" />
	<meta name="og:title" content="About" />
	<meta name="og:url" content="https://timelinerys.holoen.fans/about" />
	<meta name="twitter:title" content="About - AnniversaRyS 2023" />
</svelte:head>

<div class="background">
	<img src="/img/bg.webp" class="background-img" alt="" />
	<span class="background-overlay" />
	<div class="content">
		<div class="about-container">
			<div class="about-item" id="item-left">
				<div in:fly={{ duration: imageTransitionFlyDuration, x: -imageTransitionFlyOffset }}>
					<img
						class="about-image"
						src="/img/about/about-img-irys.webp"
						alt="IRyS doing a thumbs up"
						in:fade={{ duration: imageAppearDuration }}
					/>
				</div>
				<div
					class="about-body"
					in:fade={{ delay: bodyDelayDuration, duration: bodyAppearDuration }}
				>
					<div
						in:fly={{
							delay: bodyDelayDuration,
							duration: descriptionTransitionFlyDuration,
							y: descriptionTransitionFlyOffset,
							easing: backOut
						}}
					>
						<div class="header">About IRyS</div>
						<div class="about-body-desc">
							IRyS is the Diva of hololive English's Project: HOPE.<br />
							Check out her channel <a href={link_irys} target="_blank">here</a>!
						</div>
					</div>
				</div>
			</div>

			<div class="about-item" id="item-right">
				<div in:fly={{ duration: imageTransitionFlyDuration, x: imageTransitionFlyOffset }}>
					<picture>
						<!--Display a special image when the layout of items change-->
						<source srcset="/img/about/about-img-server-split.webp" media="(max-width: 767px)" />
						<img
							class="about-image"
							src="/img/about/about-img-server.webp"
							alt="GuyRyS doing half a heart on the left"
							in:fade={{ duration: imageAppearDuration }}
						/>
					</picture>
				</div>
				<div
					class="about-body"
					in:fade={{ delay: bodyDelayDuration, duration: bodyAppearDuration }}
				>
					<div
						in:fly={{
							delay: bodyDelayDuration,
							duration: descriptionTransitionFlyDuration,
							y: descriptionTransitionFlyOffset,
							easing: backOut
						}}
					>
						<div class="header">About Us</div>
						<div class="about-body-desc">
							This fan project is brought to you by the IRyStocrats in
							<a href={link_irys_discord} target="blank">IRyS' Stage</a> (IRyS' fan discord) and
							<a href={link_holoenfans_discord} target="_blank">HoloEN Fans</a>.
						</div>
					</div>
				</div>
			</div>
		</div>
		<div class="credits">
			<div class="header">Site Credits</div>
			<div class="credits-container">
				<Credits />
			</div>
		</div>
	</div>
</div>

<style>
	.background {
		background-color: #242424;
	}

	.background-img {
		object-fit: cover;
		object-position: center;
		position: fixed;
		top: 0;
		width: 100vw;
		height: 100vh;
	}

	.background-overlay {
		backdrop-filter: blur(5px);
		background-color: rgb(24, 18, 23, 0.4);
		background-position: top;
		background-size: cover;
		position: fixed;
		top: 0;
		width: 100%;
		height: 100%;
		z-index: 1;
	}

	.content {
		padding-top: 84px;
		position: relative;
		z-index: 2;
	}

	.about-container {
		display: grid;
		grid-template-columns: 1fr;
		padding: 0px calc(0.2 * (max(0px, 100vw - 800px)) + 16px); /*Min padding at 768px which increases with vw*/
	}

	.about-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-bottom: 84px;
	}

	.about-image {
		max-width: 350px;
		width: 100%;
		filter: drop-shadow(8px 8px 0.35rem rgb(0, 0, 0, 0.5));
	}

	.about-body {
		align-items: center;
		display: flex;
		flex-direction: column;
		margin-top: 32px;
		max-width: 500px;
	}

	.about-body-desc {
		color: white;
		font-size: 24px;
		margin-top: 24px;
		text-align: center;
		text-shadow: 2px 2px 0.25rem rgb(0, 0, 0, 0.5);
	}

	.about-body-desc a {
		color: rgb(248, 112, 162);
	}

	.header {
		color: white;
		font-size: 40px;
		text-align: center;
		text-shadow: 2px 4px 0.4rem rgb(0, 0, 0, 0.8);
	}

	.credits {
		padding-top: 64px;
		padding-bottom: 16px;
		background: linear-gradient(to bottom, rgb(0, 0, 0, 0) 0%, rgb(0, 0, 0, 0.5) 6%);
	}

	.credits-container {
		margin-top: 16px;
	}

	@media (min-width: 768px) {
		.about-container {
			grid-template-columns: 1fr 1fr;
		}

		.about-item {
			padding: 24px 48px;
		}

		.about-body-desc {
			padding-left: 32px;
			padding-right: 32px;
		}

		#item-left {
			padding-right: 0px;
			margin-left: auto;
		}

		#item-right {
			padding-left: 0px;
			margin-right: auto;
		}
	}
</style>
