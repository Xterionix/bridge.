import ProjectConfig from '../../Project/Config'
import { CURRENT, MOJANG_PATH } from '../../constants'
import LoadingWindow from '../../../windows/LoadingWindow'
import { join } from 'path'
import trash from 'trash'
import { remote } from 'electron'
import EventBus from '../../EventBus'
import { promises as fs } from 'fs'
import { refreshCache } from '../../Project/RefreshCache'
import { zip } from 'zip-a-folder'
import { createNotification } from '../Footer/create'
import { getFormatVersions } from '../../autoCompletions/components/VersionedTemplate/Common'
import {
	createInformationWindow,
	createInputWindow,
	createDropdownWindow,
	createConfirmWindow,
	createConfigWindow,
} from '../Windows/Common/CommonDefinitions'
import { trigger } from '../../AppCycle/EventSystem'

export default [
	{
		icon: 'mdi-rename-box',
		title: 'Project Namespace',
		action: async () => {
			let prefix
			try {
				prefix = await ProjectConfig.prefix
			} catch (e) {
				prefix = 'bridge'
			}

			createInputWindow(
				'Project Namespace',
				'Namespace',
				prefix,
				'',
				val => ProjectConfig.setPrefix(val)
			)
		},
	},
	{
		icon: 'mdi-cog',
		title: 'Project Config',
		action: async () => {

			createConfigWindow(
				'Project Config',
				'Namespace',
				await getExperimentalStatus('holiday_creator_features'),
				await getExperimentalStatus('custom_biomes'),
				await getExperimentalStatus('upcoming_creator_features'),
				await getExperimentalStatus('scripting'),
				await getExperimentalStatus('molang_features'),
				await getExperimentalStatus('experimental_cameras'),
				async val => {
					await ProjectConfig.setHolidayCreatorFeatures(val[0])
					await ProjectConfig.setCustomBiome(val[1])
					await ProjectConfig.setUpcomingCreatorFeatures(val[2])
					await ProjectConfig.setScripting(val[3])
					await ProjectConfig.setMolangFeatures(val[4])
					await ProjectConfig.setExperimentalCameras(val[5])
				}
			)
		},
	},
	{
		icon: 'mdi-numeric',
		title: 'Project Target Version',
		action: async () => {
			let formatVersion
			try {
				formatVersion = await ProjectConfig.formatVersion
			} catch (e) {
				formatVersion = '1.13.0'
			}

			createDropdownWindow(
				'Project Format Version',
				'Format Version',
				getFormatVersions().reverse(),
				formatVersion,
				val => {
					ProjectConfig.setFormatVersion(val)
				}
			)
		},
	},
	{
		icon: 'mdi-reload',
		title: 'Refresh Cache',
		action: async () => {
			let win = new LoadingWindow()
			await refreshCache(false)
			await refreshCache(true, false)
			win.close()
		},
	},
	{
		icon: 'mdi-package-variant-closed',
		title: 'Package Project',
		action: async () => {
			createConfirmWindow(
				'Please backup your project before packaging it!',
				'Confirm',
				'Cancel',
				() => {
					createInputWindow(
						'Project Name',
						'Name',
						'',
						'',
						async project_name => {
							//Make sure that the resource pack can be loaded
							if (!CURRENT.RESOURCE_PACK)
								return createInformationWindow(
									'No Resource Pack',
									'Please connect a resource pack before packaging the whole project.'
								)

							//Package whole project
							let lw = new LoadingWindow()
							await fs.mkdir(
								join(MOJANG_PATH, 'bridge_proj_tmp'),
								{
									recursive: true,
								}
							)
							await Promise.all([
								zip(
									CURRENT.PROJECT_PATH,
									join(
										MOJANG_PATH,
										'bridge_proj_tmp',
										`${CURRENT.PROJECT}.mcpack`
									)
								),
								zip(
									CURRENT.RP_PATH,
									join(
										MOJANG_PATH,
										'bridge_proj_tmp',
										`${CURRENT.RESOURCE_PACK}.mcpack`
									)
								),
							])
							await zip(
								join(MOJANG_PATH, 'bridge_proj_tmp'),
								join(MOJANG_PATH, `${project_name}.mcaddon`)
							)
							await trash(join(MOJANG_PATH, 'bridge_proj_tmp'))
							lw.close()

							//Notify user the packaging is complete
							const readyPush = createNotification({
								icon: 'mdi-package-variant-closed',
								message: 'Package ready!',
								color: 'info',
								onClick: () => {
									readyPush.dispose()
									remote.shell.showItemInFolder(
										join(
											MOJANG_PATH,
											`${project_name}.mcaddon`
										)
									)
								},
							})
						}
					)
				},
				() => { }
			)
		},
	},
	{
		icon: 'mdi-delete',
		title: 'Delete Project',
		action: () => {
			createConfirmWindow(
				'Do you really want to delete this project?',
				'Confirm',
				'Cancel',
				async () => {
					let lw = new LoadingWindow()
					await trash(CURRENT.PROJECT_PATH)
					trigger('bridge:findDefaultPack', true, true)
					lw.close()
				},
				() => { }
			)
		},
	},
]

type ExperimentalFeatures = 'holiday_creator_features' | 'custom_biomes' | 'upcoming_creator_features' | 'scripting' | 'molang_features' | 'experimental_cameras'

async function getExperimentalStatus(name: ExperimentalFeatures) {

	switch (name) {
		case 'holiday_creator_features':

			try {
				return await ProjectConfig.holidayCreatorFeatures
			} catch (e) {
				return false;
			}

		case 'custom_biomes':

			try {
				return await ProjectConfig.customBiome
			} catch (e) {
				return false;
			}

		case 'upcoming_creator_features':

			try {
				return await ProjectConfig.upcomingCreatorFeatures
			} catch (e) {
				return false;
			}

		case 'scripting':

			try {
				return await ProjectConfig.scripting
			} catch (e) {
				return false;
			}

		case 'molang_features':

			try {
				return await ProjectConfig.molangFeatures
			} catch (e) {
				return false;
			}

		case 'experimental_cameras':

			try {
				return await ProjectConfig.experimentalCameras
			} catch (e) {
				return false;
			}

		default:
			break;
	}
}