import { BindableObject, Div, UUID } from '@frugal-ui/base';
import Map from 'lang-map';
import * as Monaco from 'monaco-editor';
import './editor.css';

export interface TextEditorCfg {
	shouldEditorUpdate: BindableObject<boolean>;
	selectedFile: BindableObject<string>;
	fileContents: BindableObject<string>;
	isSaved: BindableObject<boolean>;
	saveFile: () => void;
}

export default function TextEditor(configuration: TextEditorCfg) {
	const {
		shouldEditorUpdate,
		selectedFile,
		saveFile,
		fileContents,
		isSaved,
	} = configuration;

	return Div()
		.access((self) => {
			const editor = Monaco.editor.create(self, {
				fontFamily: 'mono-rg',
				automaticLayout: true,
				wordWrap: 'on',
			});

			Monaco.editor.setTheme('vs-dark');
			document.fonts.ready.then(() => {
				Monaco.editor.remeasureFonts();
			});

			editor.getModel()?.onDidChangeContent(() => {
				isSaved.value = false;
				fileContents.value = editor.getValue();
			});
			fileContents.addBinding({
				uuid: new UUID(),
				action: (newValue) => {
					//prevent infinite loop
					if (shouldEditorUpdate.value == false) return;
					shouldEditorUpdate.value = false;

					editor.setValue(newValue);
					const language = getLanguage(selectedFile.value);
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
		})
		.cssOverflow('hidden');
}

// Utility
function getLanguage(fileName: string) {
	const extension = fileName.split('.').reverse()[0];
	const language = Map.languages(extension)[0];
	if (typeof language != 'string') return 'text/plain';
	return language;
}
