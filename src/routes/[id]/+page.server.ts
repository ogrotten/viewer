import { writeFile } from 'node:fs/promises'
import { extname } from 'path'

/** @type {import('./$types').Actions} */
export const actions = {
	defunct: async ({ request }) => {
		console.log(`LOG..here`)
		const formData = await request.formData()
		const uploadedFile = formData?.get('file')
		const filename = `show/${crypto.randomUUID()}${extname(uploadedFile?.name)}`
		await writeFile(filename, Buffer.from(await uploadedFile?.arrayBuffer()))
		throw new Error("This is an error")

		return { success: true }
	}
}
