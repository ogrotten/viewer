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
	id?: string;
}

// interface HrMinSec {
// 	id: string;
// 	time: string;
// 	date: string;
// }