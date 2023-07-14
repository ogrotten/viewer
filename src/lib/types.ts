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
	now: boolean;
	title: string;
}