import FilePicker, { Types } from '@basicserver/filepicker';
import SaveDialog from '@basicserver/savedialog';
import {
	buildInterface,
	Button,
	ComputedState,
	HStack,
	Sheet,
	Spacer,
	State,
	Text,
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
	const isCreateFileSheetOpen = new State(false);

	function openFile() {
	}

	function createFile(filePath: string) {
	}

	buildInterface(
		VStack(
			HStack(
				Button({
					accessibilityLabel: 'create new file',
					iconName: 'add',
					action: () => isCreateFileSheetOpen.value = !isCreateFileSheetOpen.value,
				}),
				Spacer(),
				Button({
					accessibilityLabel: 'open selected file',
					text: 'Open',
					action: openFile,
				}).toggleAttr('disabled', isOpenButtonDisabled),
			)
				.useDefaultPadding()
				.useDefaultSpacing()
				.cssBorderBottom('1px solid var(--line)'),

			FilePicker(rootName, selectedFile, [Types.File]),

			Sheet(
				{
					isOpen: isCreateFileSheetOpen,
					accessibilityLabel: 'create file',
				},
				SaveDialog(rootName, rootPath, createFile),
			),
		),
	);
}
