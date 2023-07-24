#!/usr/bin/env node
import init from './init.js';

const argv = process.argv;

const command = argv[2];
const args = argv.splice(3);

switch (command) {
	case 'init': {
		init();
		break;
	}
	default: console.error(`"${command}" not found`);
}
