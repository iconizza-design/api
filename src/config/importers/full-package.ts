import { RemoteDownloader } from '../../downloaders/remote';
import { createIconSetsPackageImporter } from '../../importers/full/json';
import type { RemoteDownloaderOptions } from '../../types/downloaders/remote';
import type { ImportedData } from '../../types/importers/common';

/**
 * Importer for all icon sets from `@iconizza/json` package
 */

// Source options, select one you prefer

// Import from NPM. Does not require any additonal configuration
const npm: RemoteDownloaderOptions = {
	downloadType: 'npm',
	package: '@iconizza/json',
};

// Import from GitHub. Requires setting GitHub API token in environment variable `GITHUB_TOKEN`
const github: RemoteDownloaderOptions = {
	downloadType: 'github',
	user: 'iconizza',
	repo: 'icon-sets',
	branch: 'master',
	token: process.env['GITHUB_TOKEN'] || '',
};

// Import from GitHub using git client. Does not require any additonal configuration
const git: RemoteDownloaderOptions = {
	downloadType: 'git',
	remote: 'https://github.com/iconizza/icon-sets.git',
	branch: 'master',
};

export const fullPackageImporter = createIconSetsPackageImporter(
	new RemoteDownloader<ImportedData>(
		npm,
		// Automatically update on startup: boolean
		true
	),
	{
		// Filter icon sets. Returns true if icon set should be included, false if not
		filter: (prefix, info) => {
			return true;
		},
	}
);
