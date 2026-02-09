import type { AdvisorTip, AdvisorState } from '$lib/types';

class AdvisorStore {
	queue = $state<AdvisorTip[]>([]);
	activeTip = $derived(this.queue[0] ?? null);
	state = $state<AdvisorState>({ seenTips: [], dismissedTips: [], appliedTips: [] });

	enqueue(tips: AdvisorTip[]): void {
		const filtered = tips.filter(
			(t) =>
				!this.state.dismissedTips.includes(t.id) &&
				!this.queue.some((q) => q.id === t.id)
		);
		if (filtered.length === 0) return;
		this.queue = [...this.queue, ...filtered]
			.sort((a, b) => b.priority - a.priority)
			.slice(0, 10);
	}

	dismiss(): void {
		if (!this.activeTip) return;
		this.state.dismissedTips = [...this.state.dismissedTips, this.activeTip.id];
		this.state.seenTips = [...this.state.seenTips, this.activeTip.id];
		this.queue = this.queue.slice(1);
	}

	apply(): void {
		if (!this.activeTip) return;
		this.state.appliedTips = [...this.state.appliedTips, this.activeTip.id];
		this.state.seenTips = [...this.state.seenTips, this.activeTip.id];
		this.queue = this.queue.slice(1);
	}

	next(): void {
		if (!this.activeTip) return;
		this.state.seenTips = [...this.state.seenTips, this.activeTip.id];
		this.queue = this.queue.slice(1);
	}

	hasSeenTip(tipId: string): boolean {
		return this.state.seenTips.includes(tipId);
	}

	reset(): void {
		this.state = { seenTips: [], dismissedTips: [], appliedTips: [] };
		this.queue = [];
	}
}

export const advisor = new AdvisorStore();
