import fsCb from 'fs';
const { existsSync, watch, promises } = fsCb,
	fs = promises;

import * as etgutil from '../etgutil.js';
import * as cache from './cache.js';
const mime = {
	css: 'text/css',
	htm: 'text/html',
	html: 'text/html',
	txt: 'text/plain',
	js: 'application/javascript',
	json: 'application/json',
	map: 'application/octet-stream',
	ogg: 'application/ogg',
	png: 'image/png',
};
export default async function (url) {
	const contentType = mime[url.slice(url.lastIndexOf('.') + 1)];
	if (!contentType) return reject('Unknown MIME');
	if (url.startsWith('Cards/') && !existsSync(url)) {
		const code = url.match(/^Cards\/([a-v\d]{3})\.png$/);
		if (code) {
			let icode = parseInt(code[1], 32),
				isShiny = icode & 0x4000;
			if ((icode & 0x3fff) < 5000) {
				icode += 4000;
			}
			if (isShiny) {
				return {
					status: '302',
					head: {
						Location: `/Cards/${etgutil.encodeCode(
							etgutil.asShiny(icode, false),
						)}.png`,
					},
					date: new Date(),
					buf: '',
				};
			} else {
				const unupped = etgutil.encodeCode(etgutil.asUpped(icode, false));
				if (unupped !== code[1]) {
					return {
						status: '302',
						head: { Location: `/Cards/${unupped}.png` },
						date: new Date(),
						buf: '',
					};
				}
			}
		}
		reject('ENOENT');
	}
	const [stat, buf] = await Promise.all([fs.stat(url), fs.readFile(url)]);
	watch(url, { persistent: false }, function (_e) {
		cache.rm(url);
		this.close();
	});
	stat.mtime.setMilliseconds(0);
	return {
		head: { 'Content-Type': contentType },
		date: stat.mtime,
		buf,
	};
}
