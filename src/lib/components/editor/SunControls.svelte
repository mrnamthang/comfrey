<script lang="ts">
	interface Props {
		date: Date;
		onDateChange: (date: Date) => void;
	}

	let { date, onDateChange }: Props = $props();

	let dateStr = $state(date.toISOString().split('T')[0]);
	let hour = $state(date.getHours());

	function handleDateChange() {
		const d = new Date(dateStr);
		d.setHours(hour, 0, 0, 0);
		onDateChange(d);
	}

	function handleHourChange() {
		const d = new Date(dateStr);
		d.setHours(hour, 0, 0, 0);
		onDateChange(d);
	}

	function setPreset(preset: 'summer' | 'winter' | 'equinox') {
		const year = new Date().getFullYear();
		if (preset === 'summer') dateStr = `${year}-06-21`;
		else if (preset === 'winter') dateStr = `${year}-12-21`;
		else dateStr = `${year}-03-20`;
		handleDateChange();
	}
</script>

<div class="space-y-2 rounded-lg bg-orange-50 p-3">
	<h4 class="text-xs font-semibold uppercase tracking-wide text-orange-700">Sun Path</h4>

	<div>
		<label for="sun-date" class="block text-xs text-stone-500">Date</label>
		<input
			id="sun-date"
			type="date"
			bind:value={dateStr}
			oninput={handleDateChange}
			class="mt-0.5 w-full rounded border border-stone-200 px-2 py-1 text-sm"
		/>
	</div>

	<div>
		<label for="sun-hour" class="block text-xs text-stone-500">Time: {hour}:00</label>
		<input
			id="sun-hour"
			type="range"
			min="0"
			max="23"
			step="1"
			bind:value={hour}
			oninput={handleHourChange}
			class="w-full"
		/>
	</div>

	<div class="flex gap-1">
		<button onclick={() => setPreset('summer')} class="rounded bg-orange-100 px-2 py-0.5 text-xs text-orange-800 hover:bg-orange-200">Summer</button>
		<button onclick={() => setPreset('winter')} class="rounded bg-blue-100 px-2 py-0.5 text-xs text-blue-800 hover:bg-blue-200">Winter</button>
		<button onclick={() => setPreset('equinox')} class="rounded bg-green-100 px-2 py-0.5 text-xs text-green-800 hover:bg-green-200">Equinox</button>
	</div>
</div>
