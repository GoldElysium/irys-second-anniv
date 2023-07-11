// Cut down version of:
// https://github.com/GoldElysium/hef-website/blob/master/src/ui/Image.tsx
// Basically removes the additional actions, since we're only using
// the imaginary proxy as a cache.

import { env } from '$env/dynamic/private';
import { createHmac } from 'node:crypto';

export default function getImaginaryProxyImageURL(
	src: string,
	width: number,
	height: number | undefined,
	quality = 90
): string {
	if (typeof src !== 'string') throw new Error('Cannot optimize static import');

	if (src.toLowerCase().endsWith('.gif')) return src;

	const query = ['type=webp', 'stripmeta=true', `width=${width}`, `quality=${quality}`];
	if (height !== undefined) {
		query.push(`height=${height}`);
	}

	const urlParam = encodeURIComponent(src.replace('localhost', 'host.docker.internal'));

	const hmac = createHmac('sha256', env.IMAGINARY_SECRET!)
		.update('/resize')
		// Yes, it needs to be sorted. See https://github.com/h2non/imaginary/issues/235#issuecomment-453833712
		// And apparently go doesn't use %20 for spaces...
		.update(
			[...query, `url=${urlParam.replace(/%20/g, '+').replace(/\(/g, '%28').replace(/\)/g, '%29')}`]
				.sort()
				.join('&')
		)
		.digest('base64url');

	return `${env.IMAGINARY_URL!}/resize?${[...query, `url=${urlParam}`]
		.sort()
		.join('&')}&sign=${hmac}`;
}
