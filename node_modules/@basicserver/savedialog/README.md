# FsExpressSaveDialog
Save dialog for BasicFsExpress

## Usage
```TypeScript
import SaveDialog from '@frugal-ui/fsexpress-savedialog';

const mySaveDialog = SaveDialog('Documents', 'path/to/documents', (filePath) => {
    console.log(`Saving to: ${filePath}`);
    /* ... */
});
```
