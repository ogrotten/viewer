export function intersectArrays(arr1, arr2) {
	//  from https://github.com/angus-c/just/blob/master/packages/array-intersect/index.cjs

	if (!Array.isArray(arr1) || !Array.isArray(arr2)) {
		throw new Error('expected both arguments to be arrays')
	}

	let result = []
	let set = convertArrayToSet(arr2)
	let memo = {}

	for (let i = 0; i < arr1.length; i++) {
		let item = arr1[i]

		if (
			Object.prototype.hasOwnProperty.call(set, item) &&
			!Object.prototype.hasOwnProperty.call(memo, item)
		) {
			result.push(item)
			memo[item] = true
		}
	}

	return result

	function convertArrayToSet(arr) {
		let output = {}

		for (let i = 0; i < arr.length; i++) {
			let item = arr[i]
			if (!Object.prototype.hasOwnProperty.call(output, item)) {
				output[item] = true
			}
		}

		return output
	}
}