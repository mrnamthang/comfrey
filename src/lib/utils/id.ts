/**
 * ID generation using crypto.randomUUID.
 */

export function createId(): string {
	return crypto.randomUUID();
}
