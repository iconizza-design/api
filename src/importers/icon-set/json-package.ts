import type { BaseDownloader } from '../../downloaders/base';
import type { BaseIconSetImporter } from '../../types/importers/icon-set';
import type { IconSetImportedData } from '../../types/importers/common';
import { IconSetJSONPackageOptions, importIconSetFromJSONPackage } from '../common/json-package';

interface JSONPackageIconSetImporterOptions extends IconSetJSONPackageOptions {
	// Icon set prefix
	prefix: string;
}

/**
 * Create importer for `@iconizza-json/*` package
 */
export function createJSONPackageIconSetImporter<Downloader extends BaseDownloader<IconSetImportedData>>(
	instance: Downloader,
	options: JSONPackageIconSetImporterOptions
): Downloader & BaseIconSetImporter {
	const obj = instance as Downloader & BaseIconSetImporter;
	const prefix = options.prefix;

	// Set static data
	const baseData: BaseIconSetImporter = {
		type: 'icon-set',
		prefix,
	};
	Object.assign(obj, baseData);

	// Load data
	obj._loadDataFromDirectory = (path: string) => importIconSetFromJSONPackage(prefix, path, options);

	return obj;
}
