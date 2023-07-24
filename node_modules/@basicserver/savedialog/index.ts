import {
	Button,
	ButtonStyles,
	HStack,
	Input, State, TextInputCfg,
	VStack
} from '@frugal-ui/base';
import FilePicker, {Types} from '@frugal-ui/fsexpress-filepicker';

type SaveFn = (filePath: string) => void;

export default function SaveDialog(
	rootName: string,
	initialDirectory: string,
	save: SaveFn,
) {
	const fileName = new State('');
	const openDirectory = new State(initialDirectory);

	return VStack(
		HStack(
			Input(new TextInputCfg(fileName, 'Untitled')),
			Button({
				style: ButtonStyles.Primary,
				accessibilityLabel: 'save here',
				text: 'Save',
				action: () => save(`${openDirectory.value}/${fileName.value}`),
			}),
		)
			.useDefaultPadding()
			.useDefaultSpacing()
			.cssBorderBottom('1px solid var(--lines)'),

		FilePicker(rootName, openDirectory, [Types.Directory]),
	);
}
