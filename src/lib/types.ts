import type { User } from 'firebase/auth'

export interface UserWithMeta extends User {
	role: string
	name: string
	id: string
}

export interface Viewer {
	id: string
	images: string[]
	portraits: number[]
	single: boolean
}

export interface Image {
	added?: number
	carousel: boolean
	filename: string
	gallery: boolean
	id?: string
	index: number
	now: boolean
	title: string
	url: string

	height?: number
	width?: number

	taller?: boolean
	wider?: boolean
}

export interface Changed {
	added?: boolean
	frame?: { x: number, y: number }
	id: string
	modded?: boolean
	removed?: boolean
}

export interface UserPref {
	carouselTime: number
	carouselTransitionTime: number
	favorites: string[]
	sort: boolean
	tiles: boolean
	sortType: "added" | "recent" | "title"
}

type Orient = 'grid' | 'square' | 'wide' | 'tall'

export interface ShowStore {
	attach: string
	carouselTime: number
	galleryTile: boolean
	showCarousel: boolean
	showGallery: boolean
	showNow: boolean
	viewer: any
	zoom: number
}
