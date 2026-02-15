<script lang="ts">
	import type { Element } from '$lib/types';
	import { getElementType } from '$lib/catalog/elements';
	import { project } from '$lib/stores/project.svelte';

	interface Props {
		element: Element;
		onDeselect: () => void;
		onDelete: (id: string) => void;
	}

	let { element, onDeselect, onDelete }: Props = $props();

	let elementType = $derived(getElementType(element.typeId));
	let label = $state(element.properties.label ?? '');

	function handleLabelChange() {
		if (!project.activeDesign) return;
		project.activeDesign.elements = project.activeDesign.elements.map((el) => {
			if (el.id !== element.id) return el;
			return { ...el, properties: { ...el.properties, label: label || undefined } };
		});
	}

	function handleMetaChange(key: string, value: unknown) {
		const newMeta = { ...element.properties.meta, [key]: value };
		project.updateElementMeta(element.id, newMeta);
	}
</script>

<div class="space-y-4">
	<div class="flex items-center justify-between">
		<h3 class="text-sm font-semibold text-stone-900">{elementType?.name ?? element.typeId}</h3>
		<button onclick={onDeselect} class="text-xs text-stone-400 hover:text-stone-600">Close</button>
	</div>

	<!-- Label -->
	<div>
		<label for="el-label" class="block text-xs font-medium text-stone-500">Label</label>
		<input
			id="el-label"
			type="text"
			bind:value={label}
			oninput={handleLabelChange}
			placeholder={elementType?.name ?? 'Element'}
			class="mt-1 w-full rounded border border-stone-200 px-2 py-1.5 text-sm text-stone-900 focus:border-green-600 focus:outline-none"
		/>
	</div>

	<!-- Rotation -->
	{#if elementType?.canRotate}
		<div>
			<label for="el-rotation" class="block text-xs font-medium text-stone-500">Rotation</label>
			<div class="mt-1 flex items-center gap-2">
				<input
					id="el-rotation"
					type="range"
					min="0"
					max="360"
					step="1"
					value={element.properties.rotation}
					oninput={(e) => project.updateElementProperties(element.id, { rotation: Number((e.target as HTMLInputElement).value) })}
					class="flex-1"
				/>
				<span class="w-10 text-right text-xs text-stone-500">{element.properties.rotation}&deg;</span>
			</div>
		</div>
	{/if}

	<!-- Scale -->
	{#if elementType?.canResize}
		<div>
			<label for="el-scale" class="block text-xs font-medium text-stone-500">Scale</label>
			<div class="mt-1 flex items-center gap-2">
				<input
					id="el-scale"
					type="range"
					min="0.5"
					max="3"
					step="0.1"
					value={element.properties.scale}
					oninput={(e) => project.updateElementProperties(element.id, { scale: Number((e.target as HTMLInputElement).value) })}
					class="flex-1"
				/>
				<span class="w-10 text-right text-xs text-stone-500">{element.properties.scale}x</span>
			</div>
		</div>
	{/if}

	<!-- Zone assignment -->
	{#if element.properties.zone != null}
		<div class="rounded bg-stone-50 px-3 py-2">
			<p class="text-xs text-stone-400">Zone</p>
			<p class="text-sm font-medium text-stone-700">Zone {element.properties.zone}</p>
		</div>
	{/if}

	<!-- Meta fields from schema -->
	{#if elementType}
		{#each Object.entries(elementType.metaSchema) as [key, field]}
			<div>
				<label for="meta-{key}" class="block text-xs font-medium text-stone-500">{field.label}</label>
				{#if field.type === 'string'}
					<input
						id="meta-{key}"
						type="text"
						value={element.properties.meta[key] as string ?? field.default ?? ''}
						oninput={(e) => handleMetaChange(key, (e.target as HTMLInputElement).value)}
						class="mt-1 w-full rounded border border-stone-200 px-2 py-1.5 text-sm"
					/>
				{:else if field.type === 'number'}
					<input
						id="meta-{key}"
						type="number"
						value={element.properties.meta[key] as number ?? field.default ?? 0}
						min={field.min}
						max={field.max}
						oninput={(e) => handleMetaChange(key, Number((e.target as HTMLInputElement).value))}
						class="mt-1 w-full rounded border border-stone-200 px-2 py-1.5 text-sm"
					/>
					{#if field.unit}
						<p class="mt-0.5 text-xs text-stone-400">{field.unit}</p>
					{/if}
				{:else if field.type === 'boolean'}
					<label class="mt-1 flex items-center gap-2">
						<input
							type="checkbox"
							checked={element.properties.meta[key] as boolean ?? field.default ?? false}
							onchange={(e) => handleMetaChange(key, (e.target as HTMLInputElement).checked)}
							class="rounded border-stone-300"
						/>
						<span class="text-sm text-stone-700">{field.label}</span>
					</label>
				{:else if field.type === 'select' && field.options}
					<select
						id="meta-{key}"
						value={element.properties.meta[key] as string ?? field.default ?? ''}
						onchange={(e) => handleMetaChange(key, (e.target as HTMLSelectElement).value)}
						class="mt-1 w-full rounded border border-stone-200 px-2 py-1.5 text-sm"
					>
						{#each field.options as option}
							<option value={option}>{option}</option>
						{/each}
					</select>
				{/if}
			</div>
		{/each}
	{/if}

	<!-- Delete button -->
	<div class="border-t border-stone-100 pt-3">
		<button
			onclick={() => onDelete(element.id)}
			class="w-full rounded bg-red-50 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-100"
		>
			Delete Element
		</button>
	</div>
</div>
