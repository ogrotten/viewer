import type { User } from 'firebase/auth'

export interface UserWithMeta extends User {
	role: string
	name: string
	id: string
}

interface Viewer {
	id: string
	images: string[]
	portraits: number[]
	single: boolean
}

export interface Image {
	added?: number
	carousel: boolean
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

interface Changed {
	added: boolean
	id: string
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