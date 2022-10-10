const FAR_CFRAME = new CFrame(0, math.huge, 0);

export class PartStash {
	private template: BasePart;
	private size: number;
	private parent: Instance;
	private readonly open: Array<BasePart> = new Array();
	private readonly inUse: Array<BasePart> = new Array();
	private readonly wasTemplateAnchored: boolean;

	constructor(template: BasePart, size: number, parent: Instance) {
		this.template = template.Clone();
		this.size = 0;
		this.parent = parent;
		this.wasTemplateAnchored = template.Anchored;

		this.setSize(size);
	}

	get() {
		const part = this.open.pop();

		if (part) {
			this.inUse.push(part);
			part.Anchored = this.wasTemplateAnchored;
			return part;
		} else {
			error("No available parts.");
		}
	}

	return(part: BasePart) {
		const index = this.inUse.indexOf(part);
		assert(index !== -1, `Part ${part.GetFullName()} is not in use.`);

		this.inUse.remove(index);

		const isOpenFull = this.open.size() === this.size;
		if (isOpenFull) {
			// Probably due to a new size smaller than this.open's size.
			part.Destroy();
		} else {
			this.open.push(part);
			part.CFrame = FAR_CFRAME;
			part.Anchored = true;
		}
	}

	getSize() {
		return this.size;
	}

	setSize(newSize: number) {
		if (newSize > this.size) {
			for (let i = 0; i < newSize - this.size; i++) {
				const part = this.template.Clone();
				part.Anchored = true;
				part.Parent = this.parent;

				this.open.push(part);
			}
		} else if (newSize < this.size && this.open.size() > 0) {
			for (let i = 0; i < math.clamp(this.size - newSize, 1, this.open.size()); i) {
				const part = this.open.pop()!;
				part.Destroy();
			}
		}

		this.size = newSize;
	}

	destroy() {
		this.template.Destroy();
		this.open.forEach((part) => part.Destroy());
		this.inUse.forEach((part) => part.Destroy());
	}
}
