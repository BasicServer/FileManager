import {writeFile} from '@basicserver/fs-frontend';
import {
	BindableObject,
	Button,
	ButtonStyles,
	Header, Sheet,
	State, VStack
} from '@frugal-ui/base';
import {clearPasswordPreference, ClearPasswordPreferences} from '../Data/defaults';
import EncryptionPopover from './EncryptionPopover';
import TextEditor from './TextEditor';

export interface EditorViewCfg {
	isEditSheetOpen: BindableObject<boolean>;
	shouldEditorUpdate: BindableObject<boolean>;
	isSaved: BindableObject<boolean>;
	fileContents: BindableObject<string>;
	selectedFile: BindableObject<string>;
}

export default function EditorView(configuration: EditorViewCfg) {
	const {
		isEditSheetOpen,
		shouldEditorUpdate,
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

				EncryptionPopover({
					fileContents,
					isSaved,
					password,
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
				shouldEditorUpdate,
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
