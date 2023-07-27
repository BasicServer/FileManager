import { LocalStorageState } from '@frugal-ui/base';

// browser config
export const ROOT_NAME = 'Root';
export const ROOT_PATH = '';

// encryption config
export enum ClearPasswordPreferences {
	Immediate = 'Immediately',
	Encryption = 'After Encrypting',
	Closing = 'When Closing',
	Never = 'Never',
}
//default
const defaultClearPasswordPreference = Object.values(ClearPasswordPreferences)[0];

export const clearPasswordPreference = new LocalStorageState(
	'clear-password',
	defaultClearPasswordPreference,
);
if (
	Object.values(ClearPasswordPreferences).indexOf(
		clearPasswordPreference.value as any,
	) == -1
)
	clearPasswordPreference.value = defaultClearPasswordPreference;

