<script lang="ts">
  import maplibregl from 'maplibre-gl';
  import 'maplibre-gl/dist/maplibre-gl.css';

  interface Props {
    center?: [number, number];
    zoom?: number;
    onMapReady?: (map: maplibregl.Map) => void;
    onMapClick?: (lngLat: { lng: number; lat: number }) => void;
  }

  let {
    center = [106.6297, 10.8231],
    zoom = 3,
    onMapReady,
    onMapClick
  }: Props = $props();

  let container: HTMLDivElement | undefined = $state();
  let webglError = $state(false);

  function isWebGLSupported(): boolean {
    try {
      const canvas = document.createElement('canvas');
      return !!(
        window.WebGLRenderingContext &&
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
      );
    } catch {
      return false;
    }
  }

  $effect(() => {
    if (!isWebGLSupported()) {
      webglError = true;
      return;
    }

    if (!container) return;

    const map = new maplibregl.Map({
      container,
      style: {
        version: 8,
        sources: {
          'google-satellite': {
            type: 'raster',
            tiles: [
              'https://mt0.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
              'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
              'https://mt2.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
              'https://mt3.google.com/vt/lyrs=s&x={x}&y={y}&z={z}'
            ],
            tileSize: 256,
            maxzoom: 21
          }
        },
        layers: [
          {
            id: 'google-satellite',
            type: 'raster',
            source: 'google-satellite',
            minzoom: 0,
            maxzoom: 22
          }
        ]
      },
      center,
      zoom,
      canvasContextAttributes: { preserveDrawingBuffer: true }
    });

    map.addControl(new maplibregl.NavigationControl(), 'top-right');

    map.on('load', () => {
      onMapReady?.(map);
    });

    map.on('click', (e: maplibregl.MapMouseEvent) => {
      onMapClick?.({ lng: e.lngLat.lng, lat: e.lngLat.lat });
    });

    return () => {
      map.remove();
    };
  });
</script>

{#if webglError}
  <div class="flex h-full w-full items-center justify-center bg-gray-100 p-8">
    <div class="max-w-md rounded-lg bg-white p-6 text-center shadow-md">
      <h2 class="mb-2 text-lg font-semibold text-red-700">WebGL Not Supported</h2>
      <p class="text-gray-600">
        Comfrey requires a browser with WebGL support. Please use Chrome, Firefox, or Safari.
      </p>
    </div>
  </div>
{:else}
  <div bind:this={container} class="h-full w-full"></div>
{/if}
