import FilePicker, { SelectedItem, Types } from '@basicserver/filepicker';
import { readFile } from '@basicserver/fs-frontend';
import {
	buildInterface,
	Button,
	ComputedState,
	Header,
	State,
	VStack,
} from '@frugal-ui/base';
import { ROOT_NAME, ROOT_PATH } from './Data/defaults';
import EditorView from './EditorView/EditorView';

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

			EditorView({
				isEditSheetOpen,
				isSaved,
				fileContents,
				selectedFile,
			})
		),
	);
}
