import { db } from '$lib/firebase';
import { getDocs, collection } from 'firebase/firestore';
import type { PageLoad } from './$types';

export const load = (async ({ params }) => {
	const attach = params.id
	const querySnapshot = await getDocs(collection(db, 'viewers', attach, 'images'))
	const galleryAll: Image[] = querySnapshot.docs.map(doc => doc.data() as Image);

	return { galleryAll };
}) satisfies PageLoad;