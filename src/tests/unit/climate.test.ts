import { describe, it, expect } from 'vitest';
import { deriveClimateType } from '$lib/services/climate';

describe('deriveClimateType', () => {
	// Real-world locations
	it('classifies Ho Chi Minh City as tropical, northern', () => {
		expect(deriveClimateType(25, 29, 1800, 10.8)).toEqual({ type: 'tropical', hemisphere: 'northern' });
	});

	it('classifies Christchurch as temperate, southern', () => {
		expect(deriveClimateType(6, 17, 640, -43.5)).toEqual({ type: 'temperate', hemisphere: 'southern' });
	});

	it('classifies Brisbane as subtropical, southern', () => {
		expect(deriveClimateType(15, 25, 1150, -27.5)).toEqual({ type: 'subtropical', hemisphere: 'southern' });
	});

	it('classifies Alice Springs as arid, southern', () => {
		expect(deriveClimateType(12, 36, 280, -23.7)).toEqual({ type: 'arid', hemisphere: 'southern' });
	});

	it('classifies Marrakech as arid, northern', () => {
		expect(deriveClimateType(11, 37, 240, 31.6)).toEqual({ type: 'arid', hemisphere: 'northern' });
	});

	it('classifies Hanoi as subtropical, northern', () => {
		expect(deriveClimateType(17, 29, 1700, 21.0)).toEqual({ type: 'subtropical', hemisphere: 'northern' });
	});

	// Boundary conditions
	it('exactly 18°C coldest month is tropical', () => {
		expect(deriveClimateType(18, 30, 1500, 10)).toEqual({ type: 'tropical', hemisphere: 'northern' });
	});

	it('17.9°C coldest month falls to subtropical', () => {
		expect(deriveClimateType(17.9, 30, 1500, 10)).toEqual({ type: 'subtropical', hemisphere: 'northern' });
	});

	it('exactly 10°C coldest month with warm summer is subtropical', () => {
		expect(deriveClimateType(10, 25, 800, -30)).toEqual({ type: 'subtropical', hemisphere: 'southern' });
	});

	it('9.9°C coldest month is temperate', () => {
		expect(deriveClimateType(9.9, 25, 800, -30)).toEqual({ type: 'temperate', hemisphere: 'southern' });
	});

	it('subtropical temp range but cool warmest month is temperate', () => {
		expect(deriveClimateType(12, 21.9, 900, 45)).toEqual({ type: 'temperate', hemisphere: 'northern' });
	});

	it('exactly 22°C warmest qualifies as subtropical', () => {
		expect(deriveClimateType(12, 22, 900, 45)).toEqual({ type: 'subtropical', hemisphere: 'northern' });
	});

	it('exactly 250mm rainfall is NOT arid (when cool enough)', () => {
		// avg annual = (8 + 20) / 2 = 14 < 18, so hot-arid rule doesn't apply
		expect(deriveClimateType(8, 20, 250, 45)).toEqual({ type: 'temperate', hemisphere: 'northern' });
	});

	it('249mm rainfall is always arid', () => {
		expect(deriveClimateType(20, 35, 249, 10)).toEqual({ type: 'arid', hemisphere: 'northern' });
	});

	it('hot-arid: 499mm with avg annual >= 18 is arid', () => {
		// avg annual = (12 + 36) / 2 = 24 >= 18
		expect(deriveClimateType(12, 36, 499, 10)).toEqual({ type: 'arid', hemisphere: 'northern' });
	});

	it('500mm with avg annual >= 18 is NOT arid', () => {
		// 500 is NOT < 500, so hot-arid rule doesn't apply; coldest 18 >= 18 → tropical
		expect(deriveClimateType(18, 35, 500, 10)).toEqual({ type: 'tropical', hemisphere: 'northern' });
	});

	it('latitude 0 is northern hemisphere', () => {
		expect(deriveClimateType(25, 28, 2000, 0)).toEqual({ type: 'tropical', hemisphere: 'northern' });
	});

	it('latitude -0.01 is southern hemisphere', () => {
		expect(deriveClimateType(25, 28, 2000, -0.01)).toEqual({ type: 'tropical', hemisphere: 'southern' });
	});
});
