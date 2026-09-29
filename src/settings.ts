import { App, PluginSettingTab, Setting } from 'obsidian';
import type SubnotePlugin from './main';

export interface SubnoteSettings {
	upPropertyKey: string;
}

export const DEFAULT_SETTINGS: SubnoteSettings = {
	upPropertyKey: 'up',
};

export class SubnoteSettingTab extends PluginSettingTab {
	private readonly plugin: SubnotePlugin;

	constructor(app: App, plugin: SubnotePlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		new Setting(containerEl)
			.setName('Up property key')
			.setDesc('Frontmatter property used in a subnote to link back to its parent note.')
			.addText((text) =>
				text
					.setPlaceholder(DEFAULT_SETTINGS.upPropertyKey)
					.setValue(this.plugin.settings.upPropertyKey)
					.onChange(async (value) => {
						this.plugin.settings.upPropertyKey = value.trim() || DEFAULT_SETTINGS.upPropertyKey;
						await this.plugin.saveSettings();
					}),
			);
	}
}
