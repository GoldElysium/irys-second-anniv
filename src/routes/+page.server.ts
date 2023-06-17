import testdata from '$lib/testdata/timeline-test-data.json';

import fetchAllFromCMS from '$lib/js/FetchFromCMS';
//import getImaginaryProxyImageURL from '$lib/js/ImaginaryImageProxyTools';
import type { TimelineData, Image } from '$lib/js/Types';

/** @type {import('./$types').PageServerLoad} */
// TODO: Write up to actual CMS as opposed to testdata.
async function loadStaticTestData() {
	let data = [];
	for (var i = 0; i < testdata.length; i++) {
		data.push({
			date: new Date(testdata[i].timestamp * 1000),
			title: testdata[i].title,
			photo: testdata[i].photo,
			content: testdata[i].content
		});
	}

	data.sort((a, b) => {
		return a.date.valueOf() - b.date.valueOf();
	});

	return {
		data: data
	};
}

function getImageObject(cmsImageData: any): Image {
	return {
		src: getImaginaryProxyImageURL(
			cmsImageData.background_image.url,
			cmsImageData.background_image.width,
			cmsImageData.background_image.height
		),
		alt: cmsImageData.background_image.alt
	};
}

// Stub function for test because i cant be arsed to set up the imaginery proxy.
function getImaginaryProxyImageURL(
	src: string,
	width: number,
	height: number,
	quality = 90
): string {
	return src;
}

const cmsRestUrl = 'http://localhost:3000/api/';
const eventSlug = 'events';
async function loadDataFromCMS(): Promise<Array<TimelineData>> {
	let data = await fetchAllFromCMS(`${cmsRestUrl}/${eventSlug}`);
	let retData = data.docs.map((element: any) => {
		return {
			date: element.date,
			title: element.title,
			background_image: getImageObject(element.background_image),
			images: element.images.map((i: any) => getImageObject(i)),
			content: element.content
		};
	});

	retData.sort((a: any, b: any) => {
		return a.date.valueOf() - b.date.valueOf();
	});

	return retData;
}

//export { loadStaticTestData as load };
export { loadDataFromCMS as load };
