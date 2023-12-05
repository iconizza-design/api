import type { IconizzaIcons, IconizzaInfo, IconizzaJSON, IconizzaMetaData } from '@iconizza/types';
import type { SplitDataTree } from '../split';
import type { MemoryStorage, MemoryStorageItem } from '../storage';
import type { IconSetIconsListIcons, IconSetAPIv2IconsList } from './extra';
import type { SplitIconizzaJSONMainData } from './split';

/**
 * Themes
 */
export type StorageIconSetThemes = Pick<IconizzaMetaData, 'prefixes' | 'suffixes'>;

/**
 * Generated data
 */
export interface StoredIconSet {
	// Icon set information
	info?: IconizzaInfo;

	// Common data
	common: SplitIconizzaJSONMainData;

	// Storage reference
	storage: MemoryStorage<IconizzaIcons>;

	// Split chunks, stored in storage
	items: MemoryStorageItem<IconizzaIcons>[];
	tree: SplitDataTree<MemoryStorageItem<IconizzaIcons>>;

	// Icons list
	icons: IconSetIconsListIcons;
	apiV2IconsCache?: IconSetAPIv2IconsList;

	// Themes
	themes?: StorageIconSetThemes;
	themeParts?: string[];
}

/**
 * Callback
 */
export type StoredIconSetDone = (result: StoredIconSet) => void;
