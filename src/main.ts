import { Plugin } from 'obsidian';
import { createSubnote, SubnoteTitleModal } from './subnote';

export default class SubnotePlugin extends Plugin {
	onload(): void {
		this.addCommand({
			id: 'add-subnote',
			name: 'Add subnote',
			checkCallback: (checking: boolean) => {
				const activeFile = this.app.workspace.getActiveFile();
				if (!activeFile) {
					return false;
				}

				if (!checking) {
					new SubnoteTitleModal(this.app, (title) => {
						void createSubnote(this.app, activeFile, title);
					}).open();
				}

				return true;
			},
		});
	}
}
