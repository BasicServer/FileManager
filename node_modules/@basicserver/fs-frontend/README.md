# BasicFsExpress-Frontend
Frontend SDK for BasicFsExpress

This is only designed to work with [this backend](https://github.com/viridian035/BasicFsExpress).

## Usage
```TypeScript
import * as Fs from 'basic-fs-express-frontend';

const contents = await Fs.readdir('/path/to/directory');
const text = await Fs.readFile('/path/to/file');

await Fs.mkdir('/path/to/new/directory');
await Fs.writeFile('/path/to/new/file', 'Hello, world!');

await Fs.rm('/path/to/file/or/directory');

await Fs.cp('/path/to/src', '/path/to/dest');
await Fs.mv('/path/to/src', '/path/to/dest');
```
