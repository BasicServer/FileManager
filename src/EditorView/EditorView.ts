import { writeFile } from '@basicserver/fs-frontend';
import {
	BindableObject,
	Button,
	ButtonStyles,
	Header,
	Input,
	Label,
	Popover,
	Select,
	Separator,
	Sheet,
	State,
	TextInputCfg,
	VStack,
} from '@frugal-ui/base';
import { clearPasswordPreference, ClearPasswordPreferences } from '../Data/defaults';
import { decryptFile, encryptFile, EncryptionFnCfg } from '../helpers';
import TextEditor from './TextEditor';

export interface EditorViewCfg {
	isEditSheetOpen: BindableObject<boolean>;
	isSaved: BindableObject<boolean>;
	fileContents: BindableObject<string>;
	selectedFile: BindableObject<string>;
}

export default function EditorView(configuration: EditorViewCfg) {
	const {
		isEditSheetOpen,
		isSaved,
		fileContents,
		selectedFile,
	} = configuration;

	function closeEditor() {
		function execute() {
			isEditSheetOpen.value = false;
			fileContents.value = '';

			if (
				clearPasswordPreference.value ==
					ClearPasswordPreferences.Immediate ||
				clearPasswordPreference.value ==
					ClearPasswordPreferences.Closing
			)
				password.value = '';

			return;
		}

		if (isSaved.value == true) return execute();

		const shouldProceed = confirm('Discard changes?');
		if (shouldProceed == false) return;

		execute();
	}

	// Encryption
	const password = new State('');
	const isEncryptionPopoverOpen = new State(false);

	function encryptOrDecrypt(action: (cfg: EncryptionFnCfg) => void) {
		action({
			fileContents,
			password,
			clearPasswordPreference,
			isSaved,
		});
	}

	// Saving
	async function saveFile() {
		if (selectedFile.value == '')
			return alert('Cannot save file: path not specified');

		try {
			await writeFile(selectedFile.value, fileContents.value);
			isSaved.value = true;
		} catch (error) {
			alert(`Failed to save file: ${error}`);
		}
	}

	return Sheet(
		{
			accessibilityLabel: 'edit file',
			isOpen: isEditSheetOpen,
		},
		VStack(
			Header(
				{
					text: 'Edit file',
				},

				Popover({
					accessibilityLabel: 'manage encryption',
					isOpen: isEncryptionPopoverOpen,
					toggle: Button({
						accessibilityLabel: 'manage encryption',
						iconName: 'key',
						action: () =>
							(isEncryptionPopoverOpen.value =
								!isEncryptionPopoverOpen.value),
					}),
					content: VStack(
						Label(
							'Password',
							Input(
								new TextInputCfg(password, '**********'),
							).setAttr('type', 'password'),
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
				}),

				Button({
					style: ButtonStyles.Primary,
					accessibilityLabel: 'save file',
					text: 'Save',
					action: saveFile,
				}).toggleAttr('disabled', isSaved),

				Button({
					accessibilityLabel: 'close editor',
					iconName: 'close',
					action: closeEditor,
				}),
			),

			TextEditor({
				selectedFile,
				fileContents,
				isSaved,
				saveFile,
			}),
		)
			.useDefaultPadding()
			.useDefaultSpacing(),
	);
}
