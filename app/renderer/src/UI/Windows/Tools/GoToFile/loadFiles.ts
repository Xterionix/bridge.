import { FileExplorerStorage } from '../../../Sidebar/FileExplorer'
import { CURRENT, BP_BASE_PATH, RP_BASE_PATH } from '../../../../constants'
import path from 'path'

export function loadFiles(): { text: string; value: string }[] {
	const BP = FileExplorerStorage.get('explorer', CURRENT.PROJECT)
		.getAllFiles()
		.map(p => ({
			text: "BP/" + path.relative(BP_BASE_PATH, p).replace(/\\/g, '/').replace(/^[^/]+\//, ''),
			value: p,
		})).filter(
			element => !element.text.includes("BP/bridge/")
		)
	//Resource Pack may be undefined
	const RP = FileExplorerStorage.get('resource_pack', CURRENT.RESOURCE_PACK)
		?.getAllFiles()
		?.map((p: string) => ({
			text: "RP/" + path.relative(RP_BASE_PATH, p).replace(/\\/g, '/').replace(/^[^/]+\//, ''),
			value: p,
		})).filter(
			element => !element.text.includes("RP/bridge/")
		)
	return BP.concat(RP || [])
}