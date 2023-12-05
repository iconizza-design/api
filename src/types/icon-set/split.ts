import type { IconizzaAliases, IconizzaJSONIconsData } from '@iconizza/types';

/**
 * Main data:
 *
 * prefix
 * aliases
 * ...optional icon dimensions
 * lastModified
 */
export interface SplitIconizzaJSONMainData extends Omit<IconizzaJSONIconsData, 'provider' | 'icons'> {
	// Last modified time
	lastModified?: number;

	// Aliases, required
	aliases: IconizzaAliases;
}
