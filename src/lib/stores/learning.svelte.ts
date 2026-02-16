import { lessons } from '$lib/catalog/lessons';
import { loadLearningProgress, saveLearningProgress } from '$lib/services/storage';
import type { ClimateType } from '$lib/types';

class LearningStore {
	completedLessons = $state<Set<string>>(new Set());
	loaded = $state(false);

	async load() {
		if (this.loaded) return;
		const ids = await loadLearningProgress();
		this.completedLessons = new Set(ids);
		this.loaded = true;
	}

	async toggleLesson(id: string) {
		const next = new Set(this.completedLessons);
		if (next.has(id)) {
			next.delete(id);
		} else {
			next.add(id);
		}
		this.completedLessons = next;
		await saveLearningProgress([...next]);
	}

	isCompleted(id: string): boolean {
		return this.completedLessons.has(id);
	}

	categoryProgress(category: string): { done: number; total: number } {
		const categoryLessons = lessons.filter((l) => l.category === category);
		const done = categoryLessons.filter((l) => this.completedLessons.has(l.id)).length;
		return { done, total: categoryLessons.length };
	}

	getSuggestedLessons(
		activePanel: string,
		activeLayers: Record<string, boolean>,
		climate?: ClimateType
	): typeof lessons {
		return lessons
			.map((lesson) => {
				let score = 0;
				if (lesson.relevance.tools.includes(activePanel)) score += 2;
				for (const [layer, active] of Object.entries(activeLayers)) {
					if (active && lesson.relevance.tools.includes(layer)) score += 2;
				}
				if (climate && lesson.relevance.climates.includes(climate)) score += 1;
				if (!this.completedLessons.has(lesson.id)) score += 1;
				return { lesson, score };
			})
			.filter(({ score }) => score > 1)
			.sort((a, b) => b.score - a.score)
			.map(({ lesson }) => lesson);
	}
}

export const learning = new LearningStore();
