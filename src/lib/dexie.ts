import Dexie, { type EntityTable } from 'dexie'
import type { Image } from './types'

export interface dexImages
	extends Image {
	id: string
}

/**
 * main db
 */
export const dexDB = new Dexie('viewerImages') as Dexie & {
	dexImages: EntityTable<
		dexImages,
		'id'
	>
}


// export const db = new Dexie('myDatabase')
dexDB.version(1).stores({
	images: 'id, added, carousel, gallery, height, index, now, title, url, width, ',
})

/**
 * end main db
 */


/**
 * download and store image
 */

export async function downloadAndStoreImage(img: Image) {
	try {
		const res = await fetch(img.url)
		const blob = await res.blob()
		// Store the binary data in indexedDB:
		await dexDB.dexImages.put({ ...img, id: img.id, blob })
	} catch (error) {
		console.error(`LOG..error`, error)
	}
}