import FilePicker, { Types } from '@basicserver/filepicker';
import { readFile, writeFile } from '@basicserver/fs-frontend';
import {
	buildInterface,
	Button,
	ButtonStyles,
	ComputedState,
	Header,
	Sheet,
	State,
	Textarea,
	VStack,
} from '@frugal-ui/base';

const rootName = 'Root';
const rootPath = '';

export async function main() {
	const selectedFile = new State(rootPath);
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
		if ((selectedFile.value == ''))
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

			FilePicker(rootName, selectedFile, [Types.File]),

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

					Textarea(fileContents, 'Type here')
						.listen('input', () => (isSaved.value = false))
						.cssHeight('100%'),
				)
					.useDefaultPadding()
					.useDefaultSpacing(),
			),
		),
	);
}
