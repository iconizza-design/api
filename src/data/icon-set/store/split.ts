import type { IconizzaIcons, IconizzaJSON } from '@iconizza/types';
import { defaultIconDimensions } from '@iconizza/utils/lib/icon/defaults';
import type { SplitIconSetConfig } from '../../../types/config/split';
import type { SplitIconizzaJSONMainData } from '../../../types/icon-set/split';

const iconDimensionProps = Object.keys(defaultIconDimensions) as (keyof typeof defaultIconDimensions)[];

const iconSetMainDataProps: (keyof SplitIconizzaJSONMainData)[] = [
	'prefix',
	'lastModified',
	'aliases',
	...iconDimensionProps,
];

/**
 * Get main data
 */
export function splitIconSetMainData(iconSet: IconizzaJSON): SplitIconizzaJSONMainData {
	const result = {} as SplitIconizzaJSONMainData;

	for (let i = 0; i < iconSetMainDataProps.length; i++) {
		const prop = iconSetMainDataProps[i];
		if (iconSet[prop]) {
			result[prop as 'prefix'] = iconSet[prop as 'prefix'];
		} else if (prop === 'aliases') {
			result[prop] = Object.create(null);
		}
	}

	if (!iconSet.aliases) {
		result.aliases = Object.create(null);
	}
	return result;
}

/**
 * Get size of icons without serialising whole thing, used for splitting icon set
 */
export function getIconSetIconsSize(icons: IconizzaIcons): number {
	let length = 0;
	for (const name in icons) {
		length += icons[name].body.length;
	}
	return length;
}

/**
 * Split icon set
 */
export function getIconSetSplitChunksCount(icons: IconizzaIcons, config: SplitIconSetConfig): number {
	const chunkSize = config.chunkSize;
	if (!chunkSize) {
		return 1;
	}

	// Calculate split based on icon count
	const numIcons = Object.keys(icons).length;
	const resultFromCount = Math.floor(numIcons / config.minIconsPerChunk);
	if (resultFromCount < 3) {
		// Too few icons: don't split
		return 1;
	}

	// Calculate number of chunks from icons size
	const size = getIconSetIconsSize(icons);
	const resultFromSize = Math.floor(size / chunkSize);
	if (resultFromSize < 3) {
		// Too small: don't split
		return 1;
	}

	return Math.min(resultFromCount, resultFromSize);
}
