export const adjectives = ["juicy", "incredible", "smooth", "soothing", "bloody", "thick", "fairy", "glimmering", "sweet"]
export const things = ["hero", "pirate", "treasure", "rocket", "moon", "mechanic", "spark", "mole"]
export const fruit = ["apple", "banana", "strawberry", "melon", "cucumber", "grape", "lemon", "orange", "tomato", "tofu", "honey"]
export const drinkType = ["smoothie", "juice", "drink", "tea", "tornado"]

export function pick<T>(n: number, collection: Array<T>): T | Array<T> | "👋💩" {
	if (n <= 0 || n >= collection.length || collection.length == 0) return "👋💩"
	n = ~~n // https://stackoverflow.com/a/34077466	
	let picks: Set<T> | Array<T> = new Set()
	while (picks.size != n) {
		picks.add(collection[~~(Math.random() * collection.length)])
	}
	picks = Array.from(picks.values())
	if (n == 1) return picks[0]
	return picks
}

console.log(`${pick(1, adjectives)}ly ${pick(1, adjectives)} ${pick(2, fruit).join(", ")} and ${pick(1, fruit)} ${pick(1, things)} ${pick(1, drinkType)}`)
