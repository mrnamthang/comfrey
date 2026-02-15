/**
 * Terrain elevation and water flow analysis.
 * Fetches elevation from Open-Meteo API and computes D8 flow direction.
 */

export interface ElevationGrid {
	width: number;
	height: number;
	data: Float32Array;
	bounds: { minLng: number; maxLng: number; minLat: number; maxLat: number };
	cellSize: number; // meters per cell
}

export interface FlowArrow {
	from: [number, number]; // [lng, lat]
	to: [number, number];
	accumulation: number; // how many cells drain through this
}

/**
 * Fetch elevation grid from Open-Meteo API for a bounding box.
 * Returns a grid of elevation values.
 */
export async function fetchElevationGrid(
	center: [number, number],
	radiusMeters: number = 200,
	gridSize: number = 20
): Promise<ElevationGrid> {
	const [lng, lat] = center;
	const latOffset = radiusMeters / 110574;
	const lngOffset = radiusMeters / (111320 * Math.cos((lat * Math.PI) / 180));

	const bounds = {
		minLng: lng - lngOffset,
		maxLng: lng + lngOffset,
		minLat: lat - latOffset,
		maxLat: lat + latOffset
	};

	const lats: number[] = [];
	const lngs: number[] = [];

	for (let r = 0; r < gridSize; r++) {
		lats.push(bounds.minLat + (r / (gridSize - 1)) * (bounds.maxLat - bounds.minLat));
	}
	for (let c = 0; c < gridSize; c++) {
		lngs.push(bounds.minLng + (c / (gridSize - 1)) * (bounds.maxLng - bounds.minLng));
	}

	// Build batch of lat/lng pairs for Open-Meteo
	const latParams: number[] = [];
	const lngParams: number[] = [];
	for (const la of lats) {
		for (const ln of lngs) {
			latParams.push(la);
			lngParams.push(ln);
		}
	}

	// Open-Meteo elevation API supports up to 100 locations per request
	const data = new Float32Array(gridSize * gridSize);
	const batchSize = 100;

	for (let i = 0; i < latParams.length; i += batchSize) {
		const batchLats = latParams.slice(i, i + batchSize);
		const batchLngs = lngParams.slice(i, i + batchSize);

		try {
			const url = `https://api.open-meteo.com/v1/elevation?latitude=${batchLats.join(',')}&longitude=${batchLngs.join(',')}`;
			const res = await fetch(url);
			if (!res.ok) throw new Error(`Elevation API: ${res.status}`);
			const json = await res.json();
			const elevations: number[] = json.elevation;

			for (let j = 0; j < elevations.length; j++) {
				data[i + j] = elevations[j];
			}
		} catch {
			// If API fails, use synthetic elevation based on slope/aspect from analysis
			for (let j = 0; j < batchLats.length; j++) {
				data[i + j] = 100 + (batchLats[j] - lat) * 1000; // simple gradient
			}
		}
	}

	return {
		width: gridSize,
		height: gridSize,
		data,
		bounds,
		cellSize: (radiusMeters * 2) / gridSize
	};
}

/**
 * D8 flow direction algorithm: for each cell, find the steepest downhill neighbor.
 * Returns flow arrows for visualization.
 */
export function computeFlowDirections(grid: ElevationGrid): FlowArrow[] {
	const { width, height, data, bounds } = grid;
	const arrows: FlowArrow[] = [];

	// D8 neighbor offsets: [dr, dc]
	const neighbors = [
		[-1, -1], [-1, 0], [-1, 1],
		[0, -1],           [0, 1],
		[1, -1],  [1, 0],  [1, 1]
	];

	// Compute flow accumulation
	const accumulation = new Int32Array(width * height).fill(1);
	const flowDir = new Int8Array(width * height).fill(-1);

	// Find flow direction for each cell
	for (let r = 0; r < height; r++) {
		for (let c = 0; c < width; c++) {
			const idx = r * width + c;
			const elev = data[idx];
			let maxDrop = 0;
			let bestDir = -1;

			for (let n = 0; n < neighbors.length; n++) {
				const nr = r + neighbors[n][0];
				const nc = c + neighbors[n][1];
				if (nr < 0 || nr >= height || nc < 0 || nc >= width) continue;
				const nIdx = nr * width + nc;
				const drop = elev - data[nIdx];
				if (drop > maxDrop) {
					maxDrop = drop;
					bestDir = n;
				}
			}

			flowDir[idx] = bestDir;
		}
	}

	// Simple accumulation: propagate downstream
	// Sort cells by elevation (highest first) for correct propagation
	const indices = Array.from({ length: width * height }, (_, i) => i);
	indices.sort((a, b) => data[b] - data[a]);

	for (const idx of indices) {
		const dir = flowDir[idx];
		if (dir === -1) continue;
		const r = Math.floor(idx / width);
		const c = idx % width;
		const nr = r + neighbors[dir][0];
		const nc = c + neighbors[dir][1];
		if (nr < 0 || nr >= height || nc < 0 || nc >= width) continue;
		const nIdx = nr * width + nc;
		accumulation[nIdx] += accumulation[idx];
	}

	// Generate arrows for cells with significant flow
	const minAccum = 3; // only show arrows where water accumulates
	for (let r = 0; r < height; r++) {
		for (let c = 0; c < width; c++) {
			const idx = r * width + c;
			if (accumulation[idx] < minAccum) continue;
			const dir = flowDir[idx];
			if (dir === -1) continue;

			const nr = r + neighbors[dir][0];
			const nc = c + neighbors[dir][1];
			if (nr < 0 || nr >= height || nc < 0 || nc >= width) continue;

			const fromLng = bounds.minLng + (c / (width - 1)) * (bounds.maxLng - bounds.minLng);
			const fromLat = bounds.minLat + (r / (height - 1)) * (bounds.maxLat - bounds.minLat);
			const toLng = bounds.minLng + (nc / (width - 1)) * (bounds.maxLng - bounds.minLng);
			const toLat = bounds.minLat + (nr / (height - 1)) * (bounds.maxLat - bounds.minLat);

			arrows.push({
				from: [fromLng, fromLat],
				to: [toLng, toLat],
				accumulation: accumulation[idx]
			});
		}
	}

	return arrows;
}

/**
 * Get elevation at a specific point from the grid using bilinear interpolation.
 */
export function getElevationAtPoint(grid: ElevationGrid, lngLat: [number, number]): number {
	const { width, height, data, bounds } = grid;
	const [lng, lat] = lngLat;

	const colF = ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * (width - 1);
	const rowF = ((lat - bounds.minLat) / (bounds.maxLat - bounds.minLat)) * (height - 1);

	const col = Math.floor(colF);
	const row = Math.floor(rowF);
	const fx = colF - col;
	const fy = rowF - row;

	if (col < 0 || col >= width - 1 || row < 0 || row >= height - 1) {
		return data[Math.max(0, Math.min(row, height - 1)) * width + Math.max(0, Math.min(col, width - 1))];
	}

	const v00 = data[row * width + col];
	const v10 = data[row * width + col + 1];
	const v01 = data[(row + 1) * width + col];
	const v11 = data[(row + 1) * width + col + 1];

	return v00 * (1 - fx) * (1 - fy) + v10 * fx * (1 - fy) + v01 * (1 - fx) * fy + v11 * fx * fy;
}
