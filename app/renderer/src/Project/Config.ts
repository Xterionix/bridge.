/**
 * Save data per project inside a "bridge/config.json" file
 */
import { CURRENT } from '../constants'
import path from 'path'
import { readJSON, writeJSON, readJSONSync } from '../Utilities/JsonFS'
import SETTINGS from '../../store/Settings'
import { on } from '../AppCycle/EventSystem'
import { getFormatVersions } from '../autoCompletions/components/VersionedTemplate/Common'

on('bridge:onProjectChanged', () => {
	ProjectConfig.prefix_cache = undefined
	ProjectConfig.formatVersionCache = undefined
	ProjectConfig.holidayCreatorFeaturesCache = undefined
	ProjectConfig.customBiomesCache = undefined
	ProjectConfig.upcomingCreatorFeaturesCache = undefined
	ProjectConfig.scriptingCache = undefined
	ProjectConfig.molangFeaturesCache = undefined
	ProjectConfig.experimentalCamerasCache = undefined
})

export default class ProjectConfig {
	static get config_path() {
		return path.join(CURRENT.PROJECT_PATH, 'bridge/config.json')
	}

	static prefix_cache: string
	static formatVersionCache: string
	static holidayCreatorFeaturesCache: boolean
	static customBiomesCache: boolean
	static upcomingCreatorFeaturesCache: boolean
	static scriptingCache: boolean
	static molangFeaturesCache: boolean
	static experimentalCamerasCache: boolean

	// Cameras

	static isExperimentalCamerasSync() {
		try {
			if (this.experimentalCamerasCache === undefined)
				this.experimentalCamerasCache =
					readJSONSync(this.config_path).experimentalCameras || false
			return this.experimentalCamerasCache
		} catch (e) {
			return false
		}
	}
	static get experimentalCameras(): Promise<boolean> {
		return (async () => {
			try {
				return (await readJSON(this.config_path)).experimentalCameras || false
			} catch {
				return false
			}
		})()
	}
	static async setExperimentalCameras(val: boolean) {
		let data
		try {
			data = await readJSON(this.config_path)
		} catch (e) {
			data = {}
		}
		this.experimentalCamerasCache = val

		await writeJSON(this.config_path, {
			...data,
			experimentalCameras: val,
		})
	}

	// Molang Features

	static isMolangFeaturesSync() {
		try {
			if (this.molangFeaturesCache === undefined)
				this.molangFeaturesCache =
					readJSONSync(this.config_path).molangFeatures || false
			return this.molangFeaturesCache
		} catch (e) {
			return false
		}
	}
	static get molangFeatures(): Promise<boolean> {
		return (async () => {
			try {
				return (await readJSON(this.config_path)).molangFeatures || false
			} catch {
				return false
			}
		})()
	}
	static async setMolangFeatures(val: boolean) {
		let data
		try {
			data = await readJSON(this.config_path)
		} catch (e) {
			data = {}
		}
		this.molangFeaturesCache = val

		await writeJSON(this.config_path, {
			...data,
			molangFeatures: val,
		})
	}

	// Scripting

	static isScriptingSync() {
		try {
			if (this.scriptingCache === undefined)
				this.scriptingCache =
					readJSONSync(this.config_path).scripting || false
			return this.scriptingCache
		} catch (e) {
			return false
		}
	}
	static get scripting(): Promise<boolean> {
		return (async () => {
			try {
				return (await readJSON(this.config_path)).scripting || false
			} catch {
				return false
			}
		})()
	}
	static async setScripting(val: boolean) {
		let data
		try {
			data = await readJSON(this.config_path)
		} catch (e) {
			data = {}
		}
		this.scriptingCache = val

		await writeJSON(this.config_path, {
			...data,
			scripting: val,
		})
	}

	// Upcoming Creator Features

	static isUpcomingCreatorFeaturesSync() {
		try {
			if (this.upcomingCreatorFeaturesCache === undefined)
				this.upcomingCreatorFeaturesCache =
					readJSONSync(this.config_path).upcomingCreatorFeatures || false
			return this.upcomingCreatorFeaturesCache
		} catch (e) {
			return false
		}
	}
	static get upcomingCreatorFeatures(): Promise<boolean> {
		return (async () => {
			try {
				return (await readJSON(this.config_path)).upcomingCreatorFeatures || false
			} catch {
				return false
			}
		})()
	}
	static async setUpcomingCreatorFeatures(val: boolean) {
		let data
		try {
			data = await readJSON(this.config_path)
		} catch (e) {
			data = {}
		}
		this.upcomingCreatorFeaturesCache = val

		await writeJSON(this.config_path, {
			...data,
			upcomingCreatorFeatures: val,
		})
	}

	// Custom Biomes

	static isCustomBiomesSync() {
		try {
			if (this.customBiomesCache === undefined)
				this.customBiomesCache =
					readJSONSync(this.config_path).customBiomes || false
			return this.customBiomesCache
		} catch (e) {
			return false
		}
	}
	static get customBiome(): Promise<boolean> {
		return (async () => {
			try {
				return (await readJSON(this.config_path)).customBiomes || false
			} catch {
				return false
			}
		})()
	}
	static async setCustomBiome(val: boolean) {
		let data
		try {
			data = await readJSON(this.config_path)
		} catch (e) {
			data = {}
		}
		this.customBiomesCache = val

		await writeJSON(this.config_path, {
			...data,
			customBiomes: val,
		})
	}

	// Holiday Creator Features

	static isHolidayCreatorFeaturesSync() {
		try {
			if (this.holidayCreatorFeaturesCache === undefined)
				this.holidayCreatorFeaturesCache =
					readJSONSync(this.config_path).holidayCreatorFeatures || false
			return this.holidayCreatorFeaturesCache
		} catch (e) {
			return false
		}
	}
	static get holidayCreatorFeatures(): Promise<boolean> {
		return (async () => {
			try {
				return (await readJSON(this.config_path)).holidayCreatorFeatures || false
			} catch {
				return false
			}
		})()
	}
	static async setHolidayCreatorFeatures(val: boolean) {
		let data
		try {
			data = await readJSON(this.config_path)
		} catch (e) {
			data = {}
		}
		this.holidayCreatorFeaturesCache = val

		console.warn({
			...data,
			holidayCreatorFeatures: val,
		})

		await writeJSON(this.config_path, {
			...data,
			holidayCreatorFeatures: val,
		})
	}

	//PREFIX
	static getPrefixSync() {
		try {
			if (this.prefix_cache === undefined)
				this.prefix_cache =
					readJSONSync(this.config_path).prefix || 'bridge'
			return this.prefix_cache
		} catch (e) {
			return 'bridge'
		}
	}
	static get prefix(): Promise<string> {
		return (async () => {
			try {
				return (await readJSON(this.config_path)).prefix || 'bridge'
			} catch {
				return 'bridge'
			}
		})()
	}
	static async setPrefix(val: string) {
		let data
		try {
			data = await readJSON(this.config_path)
		} catch (e) {
			data = {}
		}
		this.prefix_cache = val

		await writeJSON(this.config_path, {
			...data,
			prefix: val,
		})
	}
	static getFormatVersionSync() {
		try {
			if (this.formatVersionCache === undefined)
				this.formatVersionCache =
					readJSONSync(this.config_path).formatVersion ||
					getFormatVersions().pop()
			return this.formatVersionCache
		} catch (e) {
			return getFormatVersions().pop()
		}
	}
	static get formatVersion(): Promise<string> {
		return (async () => {
			try {
				return (
					(await readJSON(this.config_path)).formatVersion ||
					getFormatVersions().pop()
				)
			} catch {
				return getFormatVersions().pop()
			}
		})()
	}
	static async setFormatVersion(val: string) {
		let data
		try {
			data = await readJSON(this.config_path)
		} catch (e) {
			data = {}
		}
		this.formatVersionCache = val

		await writeJSON(this.config_path, {
			...data,
			formatVersion: val,
		})
	}
	static get theme(): Promise<string> {
		return (async () => {
			try {
				return (
					(await readJSON(this.config_path)).theme[
					SETTINGS.load().id
					] || 'bridge.null'
				)
			} catch {
				return 'bridge.null'
			}
		})()
	}
	static async setTheme(val: string) {
		let data
		try {
			data = await readJSON(this.config_path)
		} catch (e) {
			data = {}
		}

		await writeJSON(this.config_path, {
			...data,
			theme: {
				...(data.theme || {}),
				[SETTINGS.load().id]: val,
			},
		})
	}
}
