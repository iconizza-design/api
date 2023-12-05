import { readFile } from 'node:fs/promises';
import { matchIconName } from '@iconizza/utils/lib/icon/name';
import type { BaseDownloader } from '../../downloaders/base';
import type { ImportedData } from '../../types/importers/common';
import type { BaseFullImporter } from '../../types/importers/full';
import { createBaseImporter } from './base';
import { IconSetJSONOptions, importIconSetFromJSON } from '../common/icon-set-json';
import type { IconizzaInfo } from '@iconizza/types';

interface IconSetsPackageImporterOptions extends IconSetJSONOptions {
	// Icon set filter
	filter?: (prefix: string, info: IconizzaInfo) => boolean;
}

/**
 * Create importer for all .json files in directory
 */
export function createIconSetsPackageImporter<Downloader extends BaseDownloader<ImportedData>>(
	downloader: Downloader,
	options: IconSetsPackageImporterOptions = {}
): Downloader & BaseFullImporter {
	const obj = createBaseImporter(downloader);

	// Load collections list
	obj._loadCollectionsListFromDirectory = async (path: string) => {
		let prefixes: string[];
		let data: Record<string, IconizzaInfo>;
		try {
			data = JSON.parse(await readFile(path + '/collections.json', 'utf8')) as Record<string, IconizzaInfo>;
			prefixes = Object.keys(data).filter((prefix) => matchIconName.test(prefix));

			if (!(prefixes instanceof Array)) {
				console.error(`Error loading "collections.json": invalid data`);
				return;
			}
		} catch (err) {
			console.error(err);
			return;
		}

		// Filter keys
		const filter = options?.filter;
		if (filter) {
			prefixes = prefixes.filter((prefix) => filter(prefix, data[prefix]));
		}
		return prefixes;
	};

	// Load icon set
	obj._loadIconSetFromDirectory = async (prefix: string, path: string) =>
		importIconSetFromJSON(prefix, path, '/json/' + prefix + '.json', options);

	return obj;
}
