import { App, Modal, normalizePath, Notice, Setting, TFile } from 'obsidian';

export class SubnoteTitleModal extends Modal {
	private title = '';
	private readonly onSubmit: (title: string) => void;

	constructor(app: App, onSubmit: (title: string) => void) {
		super(app);
		this.onSubmit = onSubmit;
	}

	onOpen(): void {
		const { contentEl } = this;

		contentEl.createEl('h2', { text: 'Add subnote' });

		new Setting(contentEl).setName('Title').addText((text) => {
			text.inputEl.focus();
			text.onChange((value) => {
				this.title = value;
			});
			text.inputEl.addEventListener('keydown', (evt: KeyboardEvent) => {
				if (evt.key === 'Enter') {
					evt.preventDefault();
					this.submit();
				}
			});
		});

		new Setting(contentEl).addButton((button) =>
			button
				.setButtonText('Create')
				.setCta()
				.onClick(() => this.submit()),
		);
	}

	onClose(): void {
		this.contentEl.empty();
	}

	private submit(): void {
		const title = this.title.trim();
		if (!title) {
			new Notice('Enter a title for the subnote.');
			return;
		}
		this.close();
		this.onSubmit(title);
	}
}

export async function createSubnote(app: App, parent: TFile, title: string): Promise<void> {
	const folderPath = parent.parent && !parent.parent.isRoot() ? parent.parent.path : '';
	const path = normalizePath(`${folderPath}/${parent.basename}.${title}.md`);

	if (app.vault.getAbstractFileByPath(path)) {
		new Notice(`"${path}" already exists.`);
		return;
	}

	try {
		const file = await app.vault.create(path, '');
		await app.workspace.getLeaf(false).openFile(file);
	} catch (error) {
		new Notice(`Could not create subnote: ${error instanceof Error ? error.message : String(error)}`);
	}
}
