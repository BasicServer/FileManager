import FilePicker, { SelectedItem, Types } from '@basicserver/filepicker';
import { readFile, writeFile } from '@basicserver/fs-frontend';
import {
	buildInterface,
	Button,
	ButtonStyles,
	ComputedState,
	Div,
	Header,
	Sheet,
	State,
	UUID,
	VStack,
} from '@frugal-ui/base';
import Map from 'lang-map';
import StringCrypto from 'string-crypto';
import * as Monaco from 'monaco-editor';
import './editor.css';

const rootName = 'Root';
const rootPath = '';
const Crypto = new StringCrypto();

export async function main() {
	const selectedFile = new State(rootPath);
	const selectedItem = new SelectedItem((item) => {
		selectedFile.value = item.path ?? '';
	});
	const isOpenButtonDisabled = new ComputedState({
		statesToBind: [selectedFile],
		initialValue: false,
		compute(self) {
			self.value = selectedFile.value == '';
		},
	});

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

			FilePicker(rootName, selectedFile.value, selectedItem, [Types.File]),

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
								padding: '1rem',
							});

							Monaco.editor.setTheme('vs-dark');

							self.addEventListener('input', () => {
								isSaved.value = false;
								fileContents.value = editor.getValue();
							});
							fileContents.addBinding({
								uuid: new UUID(),
								action: (newValue) => {
									if (isEditSheetOpen.value == true) return;

									editor.setValue(newValue);
									const language = getLanguage(selectedFile.value);
									Monaco.editor.setModelLanguage(editor.getModel()!, language)
								}
							});
						})

						.addToClass('editor-containers'),
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
