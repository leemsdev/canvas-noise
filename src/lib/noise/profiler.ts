type Profiler = {
	timeTaken: number,
	name: string,

	startTime: number,
	endTime: number,
}

const active: Profiler[] = []

function register(name: string): number {
	const nextIdx = active.length

	active.push({ name, timeTaken: 0, startTime: -1, endTime: -1 })

	return nextIdx
}

function get(i: number): Profiler {
	const p = active[i]

	if (!p) throw new Error("Invalid profiler id")

	return p

}

function start(i: number) {
	const p = get(i)

	p.startTime = new Date().getSeconds()
}

function stop(i: number) {
	const p = get(i)
	const endTime = new Date().getSeconds()

	p.endTime = endTime
	p.timeTaken = Math.abs(endTime - p.startTime)
}

function logAllAndRelease() {
	while (active.length > 0) {
		const p = active.pop()

		if (!p) break

		console.log(`
Profiler (${p.name}):

	started: ${p?.startTime}
	ended: ${p?.endTime}
	elapsedTime: ${p?.timeTaken}
`)
	}
}

export const profiler = {
	register,
	start,
	stop,
	logAllAndRelease
}
