import { doc, getDoc } from 'firebase/firestore';
import type { PageLoad } from './$types';
import { db } from '$lib/firebase';
import { dbUser } from '$lib/firestore';

export const load = (async ({ params }) => {
	const viewRef = doc(db, `viewers/${params.id}`);
	const viewer: Viewer = getDoc(viewRef)
		.then((doc) => {
			return {
				...doc.data(), id: doc.id
			}
		})
		.catch((err) => console.error(err, JSON.stringify(err)));
	return { viewer };
}) satisfies PageLoad;