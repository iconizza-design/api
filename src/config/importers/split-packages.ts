import { RemoteDownloader } from '../../downloaders/remote';
import { createJSONCollectionsListImporter } from '../../importers/collections/collections';
import { createJSONPackageIconSetImporter } from '../../importers/icon-set/json-package';
import type { IconSetImportedData, ImportedData } from '../../types/importers/common';

// Automatically update on startup: boolean
const autoUpdate = true;

/**
 * Importer for all icon sets from `@iconizza/collections` and `@iconizza-json/*` packages
 *
 * Differences from full importer in `full-package.ts`:
 * - Slower to start because it requires downloading many packages
 * - Easier to automatically keep up to date because each package is updated separately, using less storage
 */
export const splitPackagesImporter = createJSONCollectionsListImporter(
	new RemoteDownloader<ImportedData>(
		{
			downloadType: 'npm',
			package: '@iconizza/collections',
		},
		autoUpdate
	),
	(prefix) =>
		createJSONPackageIconSetImporter(
			new RemoteDownloader<IconSetImportedData>(
				{
					downloadType: 'npm',
					package: `@iconizza-json/${prefix}`,
				},
				autoUpdate
			),
			{ prefix }
		),
	{
		// Filter icon sets. Returns true if icon set should be included, false if not
		filter: (prefix, info) => {
			return true;
		},
	}
);
