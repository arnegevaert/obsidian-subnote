import { Plugin } from 'obsidian';
import { createSubnote, SubnoteTitleModal } from './subnote';
import { DEFAULT_SETTINGS, SubnoteSettings, SubnoteSettingTab } from './settings';

export default class SubnotePlugin extends Plugin {
	settings!: SubnoteSettings;

	async onload(): Promise<void> {
		await this.loadSettings();
		this.addSettingTab(new SubnoteSettingTab(this.app, this));

		this.addCommand({
			id: 'add-subnote',
			name: 'Add subnote',
			editorCheckCallback: (checking, editor, ctx) => {
				const activeFile = ctx.file;
				if (!activeFile) {
					return false;
				}

				if (!checking) {
					new SubnoteTitleModal(this.app, (title) => {
						void createSubnote(this.app, activeFile, title, editor, this.settings.upPropertyKey);
					}).open();
				}

				return true;
			},
		});
	}

	async loadSettings(): Promise<void> {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData()) as SubnoteSettings;
	}

	async saveSettings(): Promise<void> {
		await this.saveData(this.settings);
	}
}
