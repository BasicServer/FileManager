import {
	BindableObject,
	Button, Input,
	Label,
	Popover,
	Select,
	Separator, State,
	TextInputCfg,
	VStack
} from '@frugal-ui/base';
import {
	clearPasswordPreference,
	ClearPasswordPreferences
} from '../Data/defaults';
import {decryptFile, encryptFile, EncryptionFnCfg} from '../helpers';

export interface EncryptionPopoverCfg {
	fileContents: BindableObject<string>;
	password: BindableObject<string>;
	isSaved: BindableObject<boolean>;
	shouldEditorUpdate: BindableObject<boolean>;
}

export default function EncryptionPopover(configuration: EncryptionPopoverCfg) {
	const { shouldEditorUpdate, fileContents, password, isSaved } = configuration;
		
	const isOpen = new State(false);
	function encryptOrDecrypt(action: (cfg: EncryptionFnCfg) => void) {
		shouldEditorUpdate.value = true;
		action({
			fileContents,
			password,
			clearPasswordPreference,
			isSaved,
		});
	}

	return Popover({
		accessibilityLabel: 'manage encryption',
		isOpen: isOpen,
		toggle: Button({
			accessibilityLabel: 'manage encryption',
			iconName: 'key',
			action: () =>
				(isOpen.value =
					!isOpen.value),
		}),
		content: VStack(
			Label(
				'Password',
				Input(new TextInputCfg(password, '**********')).setAttr(
					'type',
					'password',
				),
			),

			Button({
				accessibilityLabel: 'decrypt file',
				iconName: 'lock_open',
				text: 'Decrypt',
				action: () => encryptOrDecrypt(decryptFile),
			}),
			Button({
				accessibilityLabel: 'encrypt file',
				iconName: 'lock',
				text: 'Encrypt',
				action: () => encryptOrDecrypt(encryptFile),
			}),

			Separator(),

			Label(
				'Clear password',
				Select(
					clearPasswordPreference,
					new State(
						Object.values(ClearPasswordPreferences).map(
							(preference) => {
								return {
									label: preference,
									value: preference,
								};
							},
						),
					),
				),
			),
		)
			.cssWidth('20rem')
			.cssHeight('auto')
			.useDefaultSpacing()
			.useDefaultPadding(),
	});
}
