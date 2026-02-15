declare module '@mapbox/mapbox-gl-draw' {
	export default class MapboxDraw {
		constructor(options?: Record<string, unknown>);
		add(geojson: GeoJSON.Feature | GeoJSON.FeatureCollection): string[];
		getAll(): GeoJSON.FeatureCollection;
		deleteAll(): this;
		changeMode(mode: string, options?: Record<string, unknown>): this;
	}
}
