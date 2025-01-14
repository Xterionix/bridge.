/**
 * Base class for managing and accessing data-driven features
 * The actual file definitions are still loaded by the auto-completion provider
 */

declare var __static: string

import TabSystem from '../TabSystem'
import Provider from '../autoCompletions/Provider'
import fs, { promises as fsp } from 'fs'
import { join, basename, extname } from 'path'
import { readJSON, readJSONSync } from '../Utilities/JsonFS'
import { escapeRegExpStr as eRE } from '../Utilities/EscapeRegExp'
import {
	FileDefinition,
	SnippetDefinition,
	ProblemDefinition,
	FileCreator,
} from './FileDefinition'
import { CacheDef } from './LightningCache'
import { runLanguageFile } from './ScriptRunner/Language/runFile'

let HIGHLIGHTER_CACHE: any = {}
let FILE_CREATOR_CACHE: any[] = []

export default class FileType {
	/**
	 * Reset is called upon reloading plugins
	 */
	static reset() {
		FILE_CREATOR_CACHE = []
		HIGHLIGHTER_CACHE = {}
	}
	static get LIB_LOADED() {
		return Provider.LIB_LOADED
	}
	static get FILE_DEFS(): FileDefinition[] {
		return Provider.FILE_DEFS
	}

	//Special method to e.g. avoid "loot_tables/blocks/something.json" being considered a "block"
	static pathIncludes(path: string, includes: string) {
		try {
			let path_arr = path
				.split(
					/development_behavior_packs|development_resource_pack|behavior_packs|resource_pack|vanilla/g
				)[1]
				.split(/\\|\//g)
			path_arr.shift()
			path_arr.shift()
			path = path_arr.join('/')

			return path.startsWith(includes)
		} catch (e) {
			// console.log(path, includes,path.includes(includes));
			return path.includes(includes)
		}
	}
	//Load files which aren't in a "development_behavior_packs" folder correctly
	static fallbackToBP(path: string) {
		return (
			path.split(
				/development_behavior_packs|development_resource_pack|behavior_packs|resource_pack|vanilla/g
			)[1] === undefined
		)
	}

	/**
	 * @param {string} file_path file_path to load
	 * @returns {string} file type id of provided file_path
	 */
	static get(file_path?: string) {
		let data = this.getData(file_path)
		if (data === undefined) return 'unknown'
		return data.id || 'unknown'
	}

	/**
	 * @param {string} file_path file_path to load
	 * @returns {object} file type definition of provided file_path
	 */
	static getData(file_path?: string, file_type?: string) {
		let path = file_path?.replace(/\\/g, '/')

		if (path === undefined && file_type === undefined) {
			try {
				path = TabSystem.getSelected().file_path?.replace(/\\/g, '/')
			} catch (e) {
				return
			}
		} else if (path === undefined) {
			path = ''
		}

		for (let def of this.FILE_DEFS) {
			// console.log(path);
			if (
				(file_type === def.id && file_type !== undefined) ||
				(this.pathIncludes(path, def.includes) &&
					(path.includes('development_behavior_packs') ||
						path.includes('behavior_packs') ||
						path.includes('/BP/') ||
						def.rp_definition ||
						this.fallbackToBP(path)))
			)
				return def
		}
	}

	/**
	 * @returns {string[]} all file type ids
	 */
	static getAll() {
		return this.FILE_DEFS.map(def => def.id)
	}
	/**
	 * @returns {object[]} all file type definitions
	 */
	static getAllData() {
		return this.FILE_DEFS
	}

	/**
	 * Loads and returns file creator data. Used by "New File" window
	 * @returns {object} file creator data
	 */
	static getFileCreators() {
		if (FILE_CREATOR_CACHE.length === 0) {
			FILE_CREATOR_CACHE = this.FILE_DEFS.reduce((acc, file) => {
				if (file.file_creator !== undefined) {
					//Load from dedicated file
					if (typeof file.file_creator === 'string')
		
						acc.push({
							target_version: file.target_version,
							rp_definition: file.rp_definition,
							...JSON.parse(
								fs
									.readFileSync(
										join(
											__static,
											'file_creator',
											`${file.file_creator}.json`
										)
									)
									.toString()
							),
						})
					//Load as plain object
					else
						acc.push({
							target_version: file.target_version,
							rp_definition: file.rp_definition,
							...file.file_creator,
						})
				}
				return acc
			}, [])
		}
		return FILE_CREATOR_CACHE
	}
	static getFileCreator(
		file_path: string,
		loadData?: FileDefinition
	): FileCreator {
		const { file_creator } = loadData ?? this.getData(file_path) ?? {}

		if (typeof file_creator === 'string') {
			return readJSONSync(
				join(__static, 'file_creator', `${file_creator}.json`)
			)
		} else {
			return file_creator
		}
	}

	/**
	 * Loads and returns the file creator icon. Used by FileDisplayer.vue and TabSystem.vue
	 * @param {string} file_path file_path to load
	 * @returns {string} file creator icon of the provided file_path
	 */
	static getFileIcon(file_path: string) {
		const data = this.getData(file_path) ?? {}

		if (data.file_creator !== undefined) {
			if (typeof data.file_creator === 'string')
				return readJSONSync(
					join(__static, 'file_creator', `${data.file_creator}.json`)
				).icon
			else return data.file_creator.icon
		}
	}

	/**
	 * Load syntax highlighter from provided data (highlighter for current tab by default)
	 * @param {object} data data to load highlighter from
	 * @returns {object} highlighter
	 */
	static getHighlighter(data = this.getData()) {
		try {
			let hl = data.highlighter
			if (typeof hl === 'object') return hl
			if (HIGHLIGHTER_CACHE[hl] === undefined)
				HIGHLIGHTER_CACHE[hl] = JSON.parse(
					fs
						.readFileSync(
							join(__static, 'highlighter', `${hl}.json`)
						)
						.toString()
				)
			return HIGHLIGHTER_CACHE[hl]
		} catch (e) {
			//Fallback to an empty highlighter for unknown file types
			return {
				define: {
					keywords: [],
					symbols: [],
					titles: [],
				},
			}
		}
	}

	/**
	 * Load all text languages to register them
	 */
	static async registerMonacoLanguages() {
		let defs = this.getAllData()
		return await Promise.all(
			defs
				.filter(
					({ file_viewer }) =>
						file_viewer === 'text' || file_viewer === undefined
				)
				.map(async ({ language, ...other }) => {
					if (!language) return
					let { extension } =
						this.getFileCreator(undefined, other) ?? {}

					await runLanguageFile(
						language,
						extension ?? basename(language, extname(language))
					)
				})
		)
	}
	static async updateLanguage(language: string) {
		return await runLanguageFile(`${language}.js`, language)
	}

	static DefaultBuildArrays(file_path: string) {
		try {
			return this.getData(file_path).default_build_arrays
		} catch (e) {
			return false
		}
	}
	/**
	 * Get the documentation to use for the provided file path
	 * @param {string} file_path documentation to load
	 * @returns {string} encoded documentation location (URL part)
	 */
	static getDocumentation(file_path: string) {
		return (this.getData(file_path) || {}).documentation
	}

	static async getSnippets() {
		let file_types = this.getAllData()
		let snippet_data: SnippetDefinition = {}
		let proms = []

		for (let { id, snippets } of file_types) {
			if (snippets === undefined) continue
			proms.push(
				readJSON(join(__static, 'snippets', `${snippets}.json`)).then(
					data => (snippet_data[id] = data)
				)
			)
		}

		await Promise.all(proms)
		return snippet_data
	}
	static async getProblems() {
		let file_types = this.getAllData()
		let data: { [x: string]: ProblemDefinition } = {}
		let proms = []

		for (let { problems, id } of file_types) {
			if (problems === undefined) continue
			data[id] = {}
			if (Array.isArray(problems))
				problems.forEach(problem =>
					proms.push(
						readJSON(
							join(__static, 'problems', `${problem}.json`)
						).then(p => Object.assign(data[id], p))
					)
				)
			else
				proms.push(
					readJSON(
						join(__static, 'problems', `${problems}.json`)
					).then(p => (data[id] = p))
				)
		}

		await Promise.all(proms)
		return data
	}

	static async getLightningCacheDefs(
		file_path?: string,
		file_type?: string
	): Promise<CacheDef> {
		let data = this.getData(file_path, file_type)
		if (data === undefined || data.lightning_cache === undefined) return

		return await readJSON(
			join(__static, 'lightning_cache', `${data.lightning_cache}.json`)
		)
	}

	static transformTextSeparators(text: string, file_path?: string) {
		try {
			let { text_separators } = this.getData(file_path)
			text_separators.forEach(
				s =>
					(text = text.replace(
						new RegExp(eRE(s), 'g'),
						val => ` ${val} `
					))
			)
			return text
		} catch (e) {
			return text
		}
	}

	static getCommentChar(file_path: string) {
		try {
			return this.getData(file_path).comment_character || '//'
		} catch (e) {
			return '//'
		}
	}

	static getCommentChars() {
		return this.getAllData()
			.map(({ comment_character }) => comment_character)
			.filter(c => c !== undefined)
			.concat(['//'])
	}
}
