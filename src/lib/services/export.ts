/**
 * PNG export: captures the map canvas as a downloadable image with legend overlay.
 */

import type { Element, Zone, ActionPlan } from '$lib/types';
import { getElementType } from '$lib/catalog/elements';
import { zonePresets } from '$lib/catalog/zones';

interface ExportOptions {
	mapCanvas: HTMLCanvasElement;
	projectName: string;
	elements: Element[];
	zones: Zone[];
	actionPlan?: ActionPlan | null;
	filename?: string;
}

export async function exportDesignAsPNG(options: ExportOptions): Promise<void> {
	const { mapCanvas, projectName, elements, zones, actionPlan, filename } = options;

	// Create export canvas with legend panel
	const legendWidth = 280;
	const width = mapCanvas.width + legendWidth;
	const height = mapCanvas.height;

	const canvas = document.createElement('canvas');
	canvas.width = width;
	canvas.height = height;
	const ctx = canvas.getContext('2d')!;

	// Draw map
	ctx.drawImage(mapCanvas, 0, 0);

	// Draw legend panel
	ctx.fillStyle = '#ffffff';
	ctx.fillRect(mapCanvas.width, 0, legendWidth, height);

	// Legend border
	ctx.strokeStyle = '#e7e5e4';
	ctx.lineWidth = 1;
	ctx.beginPath();
	ctx.moveTo(mapCanvas.width, 0);
	ctx.lineTo(mapCanvas.width, height);
	ctx.stroke();

	let y = 30;
	const x = mapCanvas.width + 16;

	// Title
	ctx.fillStyle = '#1c1917';
	ctx.font = 'bold 16px system-ui, sans-serif';
	ctx.fillText(projectName, x, y);
	y += 10;

	// Date
	ctx.fillStyle = '#78716c';
	ctx.font = '11px system-ui, sans-serif';
	y += 16;
	ctx.fillText(new Date().toLocaleDateString(), x, y);
	y += 24;

	// Zones legend
	if (zones.length > 0) {
		ctx.fillStyle = '#1c1917';
		ctx.font = 'bold 12px system-ui, sans-serif';
		ctx.fillText('Zones', x, y);
		y += 16;

		for (const zone of zones) {
			const preset = zonePresets.find((p) => p.level === zone.level);
			if (!preset) continue;

			// Zone color swatch
			ctx.fillStyle = zone.color;
			ctx.fillRect(x, y - 8, 12, 12);
			ctx.strokeStyle = '#a8a29e';
			ctx.lineWidth = 0.5;
			ctx.strokeRect(x, y - 8, 12, 12);

			// Zone label
			ctx.fillStyle = '#44403c';
			ctx.font = '11px system-ui, sans-serif';
			ctx.fillText(`Zone ${zone.level}: ${preset.description}`, x + 18, y);
			y += 18;
		}
		y += 8;
	}

	// Elements legend
	if (elements.length > 0) {
		ctx.fillStyle = '#1c1917';
		ctx.font = 'bold 12px system-ui, sans-serif';
		ctx.fillText('Elements', x, y);
		y += 16;

		// Group by type
		const grouped = new Map<string, number>();
		for (const el of elements) {
			grouped.set(el.typeId, (grouped.get(el.typeId) ?? 0) + 1);
		}

		for (const [typeId, count] of grouped) {
			const elType = getElementType(typeId);
			ctx.fillStyle = '#15803d';
			ctx.beginPath();
			ctx.arc(x + 6, y - 3, 5, 0, Math.PI * 2);
			ctx.fill();

			ctx.fillStyle = '#44403c';
			ctx.font = '11px system-ui, sans-serif';
			ctx.fillText(`${elType?.name ?? typeId} (${count})`, x + 18, y);
			y += 18;
		}
		y += 8;
	}

	// Action plan summary
	if (actionPlan && actionPlan.phases.length > 0) {
		ctx.fillStyle = '#1c1917';
		ctx.font = 'bold 12px system-ui, sans-serif';
		ctx.fillText('Action Plan', x, y);
		y += 16;

		for (const phase of actionPlan.phases) {
			if (y > height - 40) break;

			ctx.fillStyle = '#78716c';
			ctx.font = 'bold 11px system-ui, sans-serif';
			ctx.fillText(`Year ${phase.year}: ${phase.title}`, x, y);
			y += 14;

			for (const item of phase.items.slice(0, 5)) {
				if (y > height - 20) break;
				ctx.fillStyle = '#a8a29e';
				ctx.font = '10px system-ui, sans-serif';
				const text = item.description.length > 38
					? item.description.slice(0, 35) + '...'
					: item.description;
				ctx.fillText(`  - ${text}`, x, y);
				y += 13;
			}
			y += 6;
		}
	}

	// Branding
	ctx.fillStyle = '#d6d3d1';
	ctx.font = '10px system-ui, sans-serif';
	ctx.fillText('Made with Comfrey', x, height - 12);

	// Download
	const blob = await new Promise<Blob>((resolve) => {
		canvas.toBlob((b) => resolve(b!), 'image/png');
	});

	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = filename ?? `${projectName.replace(/\s+/g, '-').toLowerCase()}-design.png`;
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
	URL.revokeObjectURL(url);
}
