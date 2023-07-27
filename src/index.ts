import FilePicker, {SelectedItem, Types} from '@basicserver/filepicker';
import {readFile, writeFile} from '@basicserver/fs-frontend';
import {
	buildInterface,
	Button,
	ButtonStyles,
	ComputedState, Header,
	Input,
	Label, Popover,
	Select,
	Separator,
	Sheet, State,
	TextInputCfg, VStack
} from '@frugal-ui/base';
import {clearPasswordPreference, ClearPasswordPreferences, ROOT_NAME, ROOT_PATH} from './Data/defaults';
import Editor from './Editor/Editor';
import {decryptFile, encryptFile, EncryptionFnCfg} from './helpers';

// main
export async function main() {
	document.title = ROOT_NAME;

	// Editing
	const isEditSheetOpen = new State(false);
	const fileContents = new State('');
	const isSaved = new State(false);
	async function openFile() {
		if (selectedFile.value == '')
			return alert('Cannot open file: path not specified');
		fileContents.value = await readFile(selectedFile.value);
		isSaved.value = true;
		isEditSheetOpen.value = true;
	}

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
		})
	}

	// File selection
	const selectedFile = new State(ROOT_PATH);
	const selectedItem = new SelectedItem((item) => {
		//update title
		if (item.isDirectory == true && item.name != undefined)
			document.title = item.name;

		//select
		if (item.isDirectory == false) selectedFile.value = item.path ?? '';
		else selectedFile.value = '';
	});
	const isOpenButtonDisabled = new ComputedState({
		statesToBind: [selectedFile],
		initialValue: false,
		compute(self) {
			self.value = selectedFile.value == '';
		},
	});

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

	// Interface
	buildInterface(
		VStack(
			// Browser
			Header(
				{
					text: 'Your files',
				},
				Button({
					accessibilityLabel: 'edit selected file',
					iconName: 'edit',
					text: 'Edit',
					action: openFile,
				}).toggleAttr('disabled', isOpenButtonDisabled),
			).cssBorderBottom('1px solid var(--lines)'),

			FilePicker(ROOT_NAME, selectedFile.value, selectedItem, [
				Types.Directory,
				Types.File,
			]),

			// Editor
			Sheet(
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
										new TextInputCfg(
											password,
											'**********',
										),
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
											Object.values(
												ClearPasswordPreferences,
											).map((preference) => {
												return {
													label: preference,
													value: preference,
												};
											}),
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

					Editor({
						selectedFile,
						fileContents,
						isSaved,
						saveFile,
					}),

				)
					.useDefaultPadding()
					.useDefaultSpacing(),
			),
		),
	);
}

