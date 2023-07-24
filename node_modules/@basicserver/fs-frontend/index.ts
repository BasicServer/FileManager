// MAIN
export async function readdir(path: string) {
	path = cleanPath(path);
	const res = await fetch(`/dir/${path}`, {
		method: 'GET',
	});
	return processResponse(res);
}

export async function readFile(path: string) {
	path = cleanPath(path);
	const res = await fetch(`/file/${path}`, {
		method: 'GET',
	});
	return processResponse(res);
}

export async function mkdir(path: string) {
	path = cleanPath(path);
	const res = await fetch(`/dir/${path}`, {
		method: 'PUT',
	});
	return processResponse(res);
}

export async function writeFile(path: string, content: string) {
	path = cleanPath(path);
	const res = await fetch(`/file/${path}`, {
		method: 'PUT',
		body: JSON.stringify({ content }),
		headers: {
			'Content-Type': 'application/json',
		},
	});
	return processResponse(res);
}

export async function rm(path: string) {
	path = cleanPath(path);
	const res = await fetch(`/file/${path}`, {
		method: 'DELETE',
	});
	return processResponse(res);
}

export async function cp(src: string, dest: string) {
	src = cleanPath(src);
	dest = cleanPath(dest);
	const res = await fetch(`/copyfile`, {
		method: 'POST',
		body: JSON.stringify({ src, dest }),
		headers: {
			'Content-Type': 'application/json',
		},
	});
	return processResponse(res);
}

export async function rename(src: string, dest: string) {
	src = cleanPath(src);
	dest = cleanPath(dest);
	const res = await fetch(`/movefile`, {
		method: 'POST',
		body: JSON.stringify({ src, dest }),
		headers: {
			'Content-Type': 'application/json',
		},
	});
	return processResponse(res);
}

// UTILITY
function cleanPath(path: string): string {
	return path.replace(/^\/\//g, '');
}

function processResponse(res: Response) {
	if (res.status >= 400 && res.status < 600) throw res.statusText;
	return res.text();
}
