interface Viewer {
	id: string;
	images: string[];
	portraits: number[];
	single: boolean;
}

interface Image {
	added: number
	carousel: boolean;
	gallery: boolean;
	id?: string;
	index: number;
	now: boolean;
	title: string;
	url: string;

	height?: number;
	width?: number;
}

interface Changed {
	added: boolean
	id: string
}

interface UserPref {
	carouselTime: number
	carouselTransitionTime: number
	tiles: boolean
}
