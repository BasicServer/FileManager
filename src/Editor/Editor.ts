import {BindableObject, Div, UUID} from "@frugal-ui/base";
import Map from 'lang-map';
import * as Monaco from 'monaco-editor';
import './editor.css';

export interface EditorCfg {
	selectedFile: BindableObject<string>;
	fileContents: BindableObject<string>;
	isSaved: BindableObject<boolean>;
	saveFile: () => void;
}

export default function Editor(configuration: EditorCfg) {
	const { selectedFile, saveFile, fileContents, isSaved } = configuration;

	return Div()
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
					if (self.contains(document.activeElement)) return;

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
