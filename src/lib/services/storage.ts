/**
 * IndexedDB persistence using the idb library.
 */

import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { Project } from '$lib/types';

interface ComfreyDB extends DBSchema {
	projects: {
		key: string;
		value: Project;
		indexes: { 'by-updated': string };
	};
	learning: {
		key: string;
		value: { id: string; completedLessons: string[] };
	};
}

const DB_NAME = 'comfrey';
const DB_VERSION = 2;

let dbPromise: Promise<IDBPDatabase<ComfreyDB>> | null = null;

function getDB(): Promise<IDBPDatabase<ComfreyDB>> {
	if (!dbPromise) {
		dbPromise = openDB<ComfreyDB>(DB_NAME, DB_VERSION, {
			upgrade(db, oldVersion) {
				if (oldVersion < 1) {
					const store = db.createObjectStore('projects', { keyPath: 'id' });
					store.createIndex('by-updated', 'updatedAt');
				}
				if (oldVersion < 2) {
					db.createObjectStore('learning', { keyPath: 'id' });
				}
			}
		});
	}
	return dbPromise;
}

export async function saveProject(project: Project): Promise<void> {
	const db = await getDB();
	await db.put('projects', project);
}

export async function loadProject(id: string): Promise<Project | null> {
	const db = await getDB();
	return (await db.get('projects', id)) ?? null;
}

export async function listProjects(): Promise<Pick<Project, 'id' | 'name' | 'createdAt' | 'updatedAt'>[]> {
	const db = await getDB();
	const all = await db.getAllFromIndex('projects', 'by-updated');
	return all
		.reverse()
		.map(({ id, name, createdAt, updatedAt }) => ({ id, name, createdAt, updatedAt }));
}

export async function deleteProject(id: string): Promise<void> {
	const db = await getDB();
	await db.delete('projects', id);
}

export async function loadLearningProgress(): Promise<string[]> {
	const db = await getDB();
	const record = await db.get('learning', 'progress');
	return record?.completedLessons ?? [];
}

export async function saveLearningProgress(completedLessons: string[]): Promise<void> {
	const db = await getDB();
	await db.put('learning', { id: 'progress', completedLessons });
}

export function exportProjectJSON(project: Project): string {
	return JSON.stringify(project, null, 2);
}

export function importProjectJSON(json: string): Project {
	return JSON.parse(json);
}
