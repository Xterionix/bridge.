const compareVersions = require("compare-versions");
const { Node, Tab, Version } = Bridge

let fileFormatVersion = Bridge.GlobalNode.children[0].data;
let projectTargetVersion = Version.ProjectTarget

const releaseVersions = new Map()
	.set('minecraft:crafting_table', '1.19.50')
	.set('minecraft:display_name', '1.19.60')
	.set('minecraft:rotation', '1.19.80')
	.set('minecraft:placement_filter', '1.19.60')
	.set('minecraft:pick_collision', '1.18.0')
	.set('minecraft:aim_collision', '1.18.10')
	.set('minecraft:selection_box', '1.19.60')

const validate = () => {

	const component = Node.internal_key;

	fileFormatVersion = Bridge.GlobalNode.children[0].data;
	Node.error = undefined;

	console.warn('Validated')

	if (!releaseVersions.has(component)) return;

	if (compareVersions.compare(releaseVersions.get(component), projectTargetVersion, '>')) return;

	const isUsingOldFormatVersion = compareVersions.compare(fileFormatVersion, (releaseVersions.get(component)), '<')

	const renamedComponent = Array.from(releaseVersions.keys())[Array.from(releaseVersions.values()).indexOf(releaseVersions.get(component)) + 1]

	if (component == 'minecraft:crafting_table') {

		const isOutdated = (Node.children.map(x => x.internal_key).some(name => ['grid_size', 'custom_description'].includes(name))) || isUsingOldFormatVersion;

		if (!isOutdated) return;

		Node.error = {
			is_warning: true,
			show: true,
			message: `${component} was released from experimental in 1.19.50`,
			fix: {
				run: () => {

					Bridge.GlobalNode.children[0].edit(releaseVersions.get(component), true)

					Node.children.forEach(child => {

						const name = child.internal_key

						if (name == 'grid_size') {
							Node.removeNode(child, true)
						} else if (name == 'custom_description') {
							let newChild = child;
							newChild.internal_key = 'table_name'
							Node.add(newChild, true)
						}
					})

					Tab.setUnsaved();
					validate();
				}
			}

		}

	} else if (component == 'minecraft:display_name' || component == 'minecraft:placement_filter') {

		if (!isUsingOldFormatVersion) return;

		Node.error = {
			is_warning: true,
			show: true,
			message: `${component} was released from experimental in 1.19.60`,
			fix: {
				run: () => {

					Bridge.GlobalNode.children[0].edit(releaseVersions.get(component), true)

					Tab.setUnsaved();
					validate();
				}
			}
		}

	} else if (component == 'minecraft:rotation') {

		Node.error = {
			is_warning: true,
			show: true,
			message: `${component} was replaced with minecraft:transformation from 1.19.80+`,
			fix: {
				run: () => {

					Bridge.GlobalNode.children[0].edit(releaseVersions.get(component), true)

					const rotation = Node.clone();
					rotation.updateUUID()
					rotation.key = 'rotation';
					rotation.parent = undefined;
					rotation.internal_key = 'rotation';

					Node.editKey('minecraft:transformation', true)
					Node.children = []
					Node.add(rotation, true)

					Tab.setUnsaved();
					validate();
				}
			}
		}

	} else if (component == 'minecraft:pick_collision') {

		console.warn(renamedComponent)
		console.warn(releaseVersions.get(renamedComponent))
		console.warn(projectTargetVersion)
		console.warn(compareVersions(releaseVersions.get(renamedComponent), projectTargetVersion, '>'))
		if (compareVersions(releaseVersions.get(renamedComponent), projectTargetVersion, '>')) return;
		console.warn('asawe')

		Node.error = {
			is_warning: true,
			show: true,
			message: `${component} was renamed from 1.18.10+`,
			fix: {
				run: () => {

					Bridge.GlobalNode.children[0].edit(releaseVersions.get(renamedComponent), true)

					Node.editKey(renamedComponent, true)

					Tab.setUnsaved();
					validate();
				}
			}
		}

	}

	fileFormatVersion = Bridge.GlobalNode.children[0].data;

}

validate()
