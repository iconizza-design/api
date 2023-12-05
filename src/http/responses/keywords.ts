import { matchIconName } from '@iconizza/utils';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { searchIndex } from '../../data/search';
import { getPartialKeywords } from '../../data/search/partial';
import type { APIv3KeywordsQuery, APIv3KeywordsResponse } from '../../types/server/keywords';
import { checkJSONPQuery, sendJSONResponse } from '../helpers/json';

/**
 * Generate icons data
 */
export function generateKeywordsResponse(query: FastifyRequest['query'], res: FastifyReply) {
	const q = (query || {}) as Record<string, string>;
	const wrap = checkJSONPQuery(q);
	if (!wrap) {
		// Invalid JSONP callback
		res.send(400);
		return;
	}

	// Check if search data is available
	const searchIndexData = searchIndex.data;
	if (!searchIndexData) {
		res.send(404);
		return;
	}
	const keywords = searchIndexData.keywords;

	// Get params
	let test: string;
	let suffixes: boolean;
	let invalid: true | undefined;
	let failed = false;

	if (typeof q.prefix === 'string') {
		test = q.prefix;
		suffixes = false;
	} else if (typeof q.keyword === 'string') {
		test = q.keyword;
		suffixes = true;
	} else {
		// Invalid query
		res.send(400);
		return;
	}
	test = test.toLowerCase().trim();

	// Check if keyword is invalid
	if (!matchIconName.test(test)) {
		invalid = true;
	} else {
		// Get only last part of complex keyword
		// Testing complex keywords is not recommended, mix of parts is not checked
		const parts = test.split('-');
		if (parts.length > 1) {
			test = parts.pop() as string;
			suffixes = false;
			for (let i = 0; i < parts.length; i++) {
				if (keywords[parts[i]] === void 0) {
					// One of keywords is missing
					failed = true;
				}
			}
		}
	}

	// Generate result
	const response: APIv3KeywordsResponse = {
		...(q as unknown as APIv3KeywordsQuery),
		invalid,
		exists: failed ? false : keywords[test] !== void 0,
		matches: failed || invalid ? [] : getPartialKeywords(test, suffixes, searchIndexData)?.slice(0) || [],
	};

	sendJSONResponse(response, q, wrap, res);
}
