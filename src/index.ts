import FilePicker, { SelectedItem, Types } from '@basicserver/filepicker';
import { readFile, writeFile } from '@basicserver/fs-frontend';
import {
	buildInterface,
	Button,
	ButtonStyles,
	ComputedState,
	Div,
	Header,
	Input,
	Label,
	Popover,
	Sheet,
	State,
	TextInputCfg,
	UUID,
	VStack,
} from '@frugal-ui/base';
import { enc } from 'crypto-js';
import { decrypt, encrypt } from 'crypto-js/aes';
import Map from 'lang-map';
import * as Monaco from 'monaco-editor';
import './editor.css';

const rootName = 'Root';
const rootPath = '';

export async function main() {
	document.title = rootName;

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

	function decryptFile() {
		try {
			const decrypted = decrypt(fileContents.value, password.value);
			if (decrypted.sigBytes < 0) throw 'wrong password';
			const res = decrypted.toString(enc.Utf8);
			fileContents.value = res;
			isSaved.value = false;
		} catch {
			alert('Decryption failed. Check your password');
		}
	}
	function encryptFile() {
		try {
			const res = encrypt(fileContents.value, password.value).toString();
			fileContents.value = res;
			isSaved.value = false;
		} catch (error) {
			alert(`Encryption failed: ${error}`);
		}
	}

	// File selection
	const selectedFile = new State(rootPath);
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

	buildInterface(
		VStack(
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

			FilePicker(rootName, selectedFile.value, selectedItem, [
				Types.Directory,
				Types.File,
			]),

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
									action: decryptFile,
								}),
								Button({
									accessibilityLabel: 'encrypt file',
									iconName: 'lock',
									text: 'Encrypt',
									action: encryptFile,
								}),
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

					Div()
						.access((self) => {
							const editor = Monaco.editor.create(self, {
								fontFamily: 'mono-rg',
								automaticLayout: true,
							});

							Monaco.editor.setTheme('vs-dark');

							self.addEventListener('input', () => {
								isSaved.value = false;
								fileContents.value = editor.getValue();
							});
							fileContents.addBinding({
								uuid: new UUID(),
								action: (newValue) => {
									//prevent infinite loop
									if (self.contains(document.activeElement))
										return;

									editor.setValue(newValue);
									const language = getLanguage(
										selectedFile.value,
									);
									Monaco.editor.setModelLanguage(
										editor.getModel()!,
										language,
									);
								},
							});
						})
						.addToClass('editor-containers')
						.registerKeyboardShortcuts({
							modifiers: ['commandOrControl'],
							key: 's',
							action: (e) => {
								e.preventDefault(), saveFile();
							},
						}),
				)
					.useDefaultPadding()
					.useDefaultSpacing(),
			),
		),
	);
}

function getLanguage(fileName: string) {
	const extension = fileName.split('.').reverse()[0];
	const language = Map.languages(extension)[0];
	if (typeof language != 'string') return 'text/plain';
	return language;
}
