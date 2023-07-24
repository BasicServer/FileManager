import Fs from 'fs/promises';
import Path from 'path';

// TEMPLATES
const htmlTemplate = 
`<!DOCTYPE html>
<html>
	<head>
		<meta charset="utf-8" />
		<meta name="viewport" content="width=device-width,initial-scale=1" />

		<link rel="stylesheet" href="index.css" />
	</head>
	<body></body>
	<script src="index.js"></script>
	<script>
		APP.main();
	</script>
</html>`;

const tsTemplate = 
`import { buildInterface, Text, VStack } from '@frugal-ui/base';

export function main() {
	buildInterface(
		VStack(
			Text('Hello, world!'),
		)
	)
}`;

// MAIN
export default async function init() {
	//create files
	const filesToCreate = [
		['dist/index.html', htmlTemplate],
		['src/index.ts', tsTemplate],
	];

	for (const [path, content] of filesToCreate) {
		const dir = Path.dirname(path);
		await Fs.mkdir(dir, { recursive: true });
		await Fs.writeFile(path, content);
	}

	//update package
	let pkg: {[key: string]: any} = {};
	try {
		pkg = JSON.parse(await Fs.readFile('package.json', {encoding: 'utf8'}));
	} catch {
		console.warn('Creating package.json');
	}

	if (typeof pkg.scripts != 'object') pkg.scripts = {};
	pkg.scripts.build = 'esbuild src/index.ts --format=iife --global-name=APP --bundle --outdir=dist --loader:.woff=file --loader:.woff2=file --loader:.ttf=file --loader:.otf=file';

	Fs.writeFile('package.json', JSON.stringify(pkg, null, 2));
}
