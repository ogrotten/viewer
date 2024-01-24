interface Viewer {
	id: string;
	images: string[];
	single: boolean;
	portraits: number[];
}

interface Image {
	url: string;
	carousel: boolean;
	gallery: boolean;
	index: number;
	now: boolean;
	title: string;
	id?: string;

	height?: number;
	width?: number;
}

interface Changed {
	id: string
	added: boolean
}