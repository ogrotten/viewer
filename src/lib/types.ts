import type { User } from 'firebase/auth'

export interface UserWithMeta extends User {
	role: string;
	name: string;
	id: string;
}

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
	favorites: string[]
	sort: boolean
	tiles: boolean
}

type Orient = 'grid' | 'square' | 'wide' | 'tall'