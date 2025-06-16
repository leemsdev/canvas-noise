import alea from 'alea'
import { profiler } from './profiler'

const rnd = alea()

type Screen = {
	canvas: HTMLCanvasElement,
	context: CanvasRenderingContext2D,
	width: number,
	height: number
}

type Vec2 = {
	x: number,
	y: number
}

type Point = {
	priority: number // priority zero means not an anchor point
	location: Vec2,
	value: number,
	index: number,

	// We use the distance from the parent anchor to control the alpha
	parentAnchorDistance: number,

	neighbours: number[]
}

type Config = {
	anchors: number,
	spread: number,
	brightness: number,
	smoothing: number,
}

const config: Config = {
	anchors: 0,
	spread: 0,
	brightness: 0,
	smoothing: 0,
}

function random() {
	return rnd.fract53()
}

function vec2add(n1: Vec2, n2: Vec2): Vec2 {
	return {
		x: n1.x + n2.x,
		y: n1.y + n2.y
	}
}



// These are added on to the current position to get the neighbour's position
const GetNeighbourTransformations = [
	{ x: 0, y: -1 }, 	// above
	{ x: 1, y: 0 }, 	// right
	{ x: 0, y: 1 }, 	// below
	{ x: -1, y: 0 }, 	// left
]

function getMyNeighboursLocations(screen: Screen, point: Vec2): number[] {
	const neighbours: number[] = []

	for (const t of GetNeighbourTransformations) {
		let neighbour = vec2add(point, t)

		if (neighbour.x < 0 || neighbour.x >= screen.width) {
			continue
		}

		if (neighbour.y < 0 || neighbour.y >= screen.height) {
			continue
		}

		// It'sreally important we do x * screen.height + y here, because x is the outtermost part of the
		// init screen loop
		let neighbourIndex = (neighbour.x * screen.height) + neighbour.y

		neighbours.push(neighbourIndex)
	}

	return neighbours
}

function initScreen(screen: Screen): Point[] {
	let points: Point[] = []

	for (let x = 0; x < screen.width; x++) {
		for (let y = 0; y < screen.height; y++) {
			let index = points.length
			let location = { x, y }
			points.push({ location: { x, y }, priority: 0, value: 1, index, parentAnchorDistance: 1, neighbours: getMyNeighboursLocations(screen, location) })
		}
	}

	return points
}

function bloom(points: Point[], anchorPoint: Point) {
	let bloomQueue: Point[] = [anchorPoint]

	// Each anchor point decides on a random spread
	const mySpread = random() * config.spread

	while (bloomQueue.length > 0) {
		const current = bloomQueue.shift()

		if (!current) break

		const myPriority = current.priority

		const neighbourLocations = current.neighbours

		if (myPriority == 0) break;

		for (const n of neighbourLocations) {
			const neighbourPoint = points[n]

			if (neighbourPoint.parentAnchorDistance > mySpread) return

			// If the neighbour has a higher or equal priority than me, i cant modify it
			if (neighbourPoint.priority >= myPriority) {
				continue
			}

			// modulate the probability
			const probability = myPriority * (1 / mySpread)

			const rn = random()

			// I should modify and set it as an anchor point
			if (rn < probability) {
				neighbourPoint.priority = myPriority - 1

				let nextV = (current.value + probability) * config.brightness

				if (nextV >= 0.9) nextV = neighbourPoint.value

				neighbourPoint.value = nextV

				// Tell it that it is 1 further away from my parent anchor	
				neighbourPoint.parentAnchorDistance = current.parentAnchorDistance + 1

				bloomQueue.push(neighbourPoint)
			}
		}
	}
}

function drawScreen(points: Point[], screen: Screen) {
	screen.context.fillStyle = "rgba(255, 255, 255, 1)"
	screen.context.clearRect(0, 0, screen.width, screen.height)
	for (const p of points) {
		const alpha = 1 - (1 * p.value)

		screen.context.fillStyle = `rgba(0, 0, 0, ${alpha})`

		const { x, y } = p.location

		screen.context.fillRect(x, y, 1, 1)
	}

}

// Average each point out based on its neighbours
function smooth(points: Point[]) {
	const newValues = new Float32Array(points.length);
	for (let p of points) {
		const sum = p.neighbours.reduce((prev, current) => prev + points[current].value, 0);
		newValues[p.index] = sum / p.neighbours.length;
	}

	// Update values in a separate loop to avoid race-like issues
	for (let i = 0; i < points.length; i++) {
		points[i].value = newValues[i];
	}
}

function assert<T>(value: any, err: string): asserts value is NonNullable<T> {
	if (!value) throw new Error(err)
}

export function generate(canvasId: string, conf: Config) {
	config.anchors = conf.anchors
	config.smoothing = conf.smoothing
	config.brightness = conf.brightness
	config.spread = conf.spread

	const appProfiler = profiler.register("App")

	profiler.start(appProfiler)

	const canvas = document.getElementById(canvasId) as HTMLCanvasElement

	assert(canvas, "Canvas not found")

	const context = canvas.getContext("2d")

	assert(context, "Context not found")

	canvas.width = canvas.clientWidth
	canvas.height = canvas.clientHeight

	const dimensions = { width: canvas.width, height: canvas.height }

	let screen = {
		canvas,
		context,
		...dimensions
	}

	run(screen)

	profiler.stop(appProfiler)
	profiler.logAllAndRelease()
}

function run(screen: Screen) {
	const points = initScreen(screen)

	const anchorLoopProfiler = profiler.register("Anchor loop")
	const smoothingFnProfiler = profiler.register("Smoothing fn")
	const drawFn = profiler.register("Draw fn")

	console.log("Running...")

	profiler.start(anchorLoopProfiler)
	for (let i = 0; i < config.anchors; i++) {
		let randomAnchor = Math.floor(rnd.next() * points.length)
		const anchorPoint = points[randomAnchor]

		// Priority directly maps to spread, because each time we 
		// spread out from a point, we reduce the neighbour point's priority.
		// Meaning once we get to priority zero for an anchor, we can just stop 
		anchorPoint.priority = config.spread
		anchorPoint.value = random()

		bloom(points, anchorPoint)
	}
	profiler.stop(anchorLoopProfiler)

	profiler.start(smoothingFnProfiler)
	for (let i = 0; i < config.smoothing; i++) {
		smooth(points)
	}
	profiler.stop(smoothingFnProfiler)

	profiler.start(drawFn)
	drawScreen(points, screen)
	profiler.stop(drawFn)
}
