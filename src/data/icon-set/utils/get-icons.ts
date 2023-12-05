import type { IconizzaJSON, IconizzaAliases, IconizzaIcons } from '@iconizza/types';
import type { StoredIconSet } from '../../../types/icon-set/storage';
import { searchSplitRecordsTreeForSet } from '../../storage/split';
import { getStoredItem } from '../../storage/get';

/**
 * Get list of icons that must be retrieved
 */
export function getIconsToRetrieve(iconSet: StoredIconSet, names: string[], copyTo?: IconizzaAliases): Set<string> {
	const icons: Set<string> = new Set();
	const iconSetData = iconSet.common;
	const iconsData = iconSet.icons;
	const chars = iconsData.chars;
	const aliases = iconSetData.aliases || (Object.create(null) as IconizzaAliases);

	function resolve(name: string, nested: boolean) {
		if (!iconsData.visible[name] && !iconsData.hidden[name]) {
			// No such icon: check for character
			const charValue = chars?.[name]?.[0];
			if (!charValue) {
				return;
			}

			// Resolve character instead of alias
			copyTo &&
				(copyTo[name] = {
					parent: charValue,
				});
			resolve(charValue, true);
			return;
		}

		// Icon or alias exists
		if (!aliases[name]) {
			// Icon
			icons.add(name);
			return;
		}

		// Alias: copy it
		const item = aliases[name];
		copyTo && (copyTo[name] = item);

		// Resolve parent
		resolve(item.parent, true);
	}

	for (let i = 0; i < names.length; i++) {
		resolve(names[i], false);
	}

	return icons;
}

/**
 * Get icons from stored icon set
 */
export function getStoredIconsData(iconSet: StoredIconSet, names: string[], callback: (data: IconizzaJSON) => void) {
	// Get list of icon names
	const aliases = Object.create(null) as IconizzaAliases;
	const iconNames = Array.from(getIconsToRetrieve(iconSet, names, aliases));
	if (!iconNames.length) {
		// Nothing to retrieve
		callback({
			...iconSet.common,
			icons: Object.create(null),
			aliases,
			not_found: names,
		});
		return;
	}

	// Get map of chunks to load
	const chunks = searchSplitRecordsTreeForSet(iconSet.tree, iconNames);
	let pending = chunks.size;
	let missing: Set<string> = new Set();
	const icons = Object.create(null) as IconizzaIcons;

	const storage = iconSet.storage;
	chunks.forEach((chunkNames, storedItem) => {
		getStoredItem(storage, storedItem, (data) => {
			// Copy data from chunk
			if (!data) {
				missing = new Set([...chunkNames, ...missing]);
			} else {
				for (let i = 0; i < chunkNames.length; i++) {
					const name = chunkNames[i];
					if (data[name]) {
						icons[name] = data[name];
					} else {
						missing.add(name);
					}
				}
			}

			// Check if all chunks have loaded
			pending--;
			if (!pending) {
				const result: IconizzaJSON = {
					...iconSet.common,
					icons,
					aliases,
				};

				// Add missing icons
				for (let i = 0; i < names.length; i++) {
					const name = names[i];
					if (!icons[name] && !aliases[name]) {
						missing.add(name);
					}
				}

				if (missing.size) {
					result.not_found = Array.from(missing);
				}
				callback(result);
			}
		});
	});
}
