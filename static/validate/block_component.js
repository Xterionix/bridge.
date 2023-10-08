const compareVersions = require("compare-versions");
const { Node, Tab, Version } = Bridge

let fileFormatVersion = Bridge.GlobalNode.children[0].data;
let projectTargetVersion = Version.ProjectTarget || '0.0'

const releaseVersions = new Map()
	.set('minecraft:crafting_table', '1.19.50')
	.set('minecraft:display_name', '1.19.60')
	.set('minecraft:placement_filter', '1.19.60')
	.set('minecraft:selection_box', '1.19.60')
	.set('minecraft:collision_box', '1.19.50')
	.set('minecraft:material_instance', '1.19.40')
	.set('minecraft:geometry', '1.19.40')

const renamedVersions = new Map()
	.set('minecraft:pick_collision', '1.18.10')
	.set('minecraft:aim_collision', '1.19.20')
	.set('minecraft:entity_collision', '1.18.10')
	.set('minecraft:block_collision', '1.19.10')
	.set('minecraft:block_light_absorption', '1.18.10')
	.set('minecraft:block_light_filter', '1.19.10')
	.set('minecraft:block_light_emission', '1.19.20')

const renamedTo = new Map()
	.set('minecraft:pick_collision', 'minecraft:aim_collision')
	.set('minecraft:aim_collision', 'minecraft:selection_box')
	.set('minecraft:entity_collision', 'minecraft:block_collision')
	.set('minecraft:block_collision', 'minecraft:collision_box')
	.set('minecraft:block_light_absorption', 'minecraft:block_light_filter')
	.set('minecraft:block_light_filter', 'minecraft:light_dampening')
	.set('minecraft:block_light_emission', 'minecraft:light_emission')

const editedVersions = new Map()
	.set('minecraft:crafting_table', '1.19.10')
	.set('minecraft:flammable', '1.19.10')

const editedProperties = new Map()
	.set('grid_size', '')
	.set('custom_description', 'table_name')
	.set('flame_odds', 'catch_chance_modifier')
	.set('burn_odds', 'destroy_chance_modifier')

const replacedComponents = new Map()
	.set('minecraft:rotation', '1.19.80')
	.set('minecraft:destroy_time', '1.19.20')
	.set('minecraft:explosion_resistance', '1.19.20')
	.set('minecraft:ticking', '1.19.10')

const replacedWith = new Map()
	.set('minecraft:rotation', 'minecraft:transformation')
	.set('minecraft:destroy_time', 'minecraft:destructible_by_mining')
	.set('minecraft:explosion_resistance', 'minecraft:destructible_by_explosion')
	.set('minecraft:ticking', 'minecraft:queued_ticking')

const removedComponents = new Map()
	.set('minecraft:breakonpush', '0.0')
	.set('minecraft:immovable', '0.0')
	.set('minecraft:onlypistonpush', '0.0')
	.set('minecraft:preventsjumping', '0.0')
	.set('minecraft:unwalkable', '0.0')
	.set('minecraft:part_visibility', '0.0')

const validate = () => {

	if (compareVersions.compare(fileFormatVersion, '1.16.0', '<=')) return;

	const components = Node;

	fileFormatVersion = Bridge.GlobalNode.children[0].data;
	Node.error = undefined;

	components.children.forEach(component => {

		const component_name = component.internal_key;

		if (editedVersions.has(component_name) && compareVersions.compare(fileFormatVersion, editedVersions.get(component_name), '>=') && (component.children.map(x => x.internal_key).some(name => editedProperties.has(name)))) {

			Node.error = {
				is_warning: true,
				show: true,
				message: `${component_name}'s properties were edited in ${editedVersions.get(component_name)}`,
				fix: {
					run: () => {

						Bridge.GlobalNode.children[0].edit(editedVersions.get(component_name))

						component.forEach(child => {

							const property = child.internal_key

							if (!editedProperties.has(property)) return;

							let newProperty = {}
							newProperty[editedProperties.get(property)] = child.data

							component.removeNode(child)
							if (editedProperties.get(property) != '') component.buildFromObject(newProperty)

						})

						Tab.setUnsaved();
						validate();
					}
				}

			}

		}

		else if (releaseVersions.has(component_name) && compareVersions.compare(fileFormatVersion, (releaseVersions.get(component_name)), '<') && compareVersions.compare(releaseVersions.get(component_name), projectTargetVersion, '<=')) {

			Node.error = {
				is_warning: true,
				show: true,
				message: `${component_name} was released from experimental in ${releaseVersions.get(component_name)}`,
				fix: {
					run: () => {

						Bridge.GlobalNode.children[0].edit(releaseVersions.get(component_name), true)

						Tab.setUnsaved();
						validate();
					}
				}
			}

		}

		else if (removedComponents.has(component_name) && compareVersions.compare(fileFormatVersion, removedComponents.get(component_name), '>=') && compareVersions.compare(removedComponents.get(component_name), projectTargetVersion, '<=')) {

			Node.error = {
				is_warning: false,
				show: true,
				message: `${component_name} was removed`,
				fix: {
					run: () => {

						components.removeNode(component)

						Tab.setUnsaved();
						validate();
					}
				}
			}

		}

		else if (replacedComponents.has(component_name) && compareVersions.compare(fileFormatVersion, replacedComponents.get(component_name), '>=') && compareVersions.compare(replacedComponents.get(component_name), projectTargetVersion, '<=')) {

			Node.error = {
				is_warning: true,
				show: true,
				message: `${component_name} was replaced with ${replacedWith.get(component_name)} from ${replacedComponents.get(component_name)}`,
				fix: {
					run: () => {

						if (component_name == 'minecraft:rotation') {

							let newComponent = { 'minecraft:transformation': {} }
							newComponent["minecraft:transformation"]['rotation'] = component.toJSON()

							components.buildFromObject(newComponent)
							Bridge.GlobalNode.children[0].edit(replacedComponents.get(component_name), true)

						}

						else if (component_name == 'minecraft:destroy_time') {

							let newComponent = { 'minecraft:destructible_by_mining': {} }
							newComponent["minecraft:destructible_by_mining"]["seconds_to_destroy"] = component.data;

							components.buildFromObject(newComponent)
							Bridge.GlobalNode.children[0].edit(replacedComponents.get(component_name), true)

						}

						else if (component_name == 'minecraft:explosion_resistance') {

							let newComponent = { 'minecraft:destructible_by_explosion': {} }
							newComponent["minecraft:destructible_by_explosion"]["explosion_resistance"] = component.data;

							components.buildFromObject(newComponent)
							Bridge.GlobalNode.children[0].edit(replacedComponents.get(component_name), true)

						}

						else if (component_name == 'minecraft:ticking') {

							let newComponent = { 'minecraft:queued_ticking': {} }

							const json = component.toJSON()

							if (json.range) newComponent["minecraft:queued_ticking"]["interval_range"] = json.range;
							if (json.looping) newComponent["minecraft:queued_ticking"]["looping"] = json.looping;
							if (json.on_tick) newComponent["minecraft:queued_ticking"]["on_tick"] = json.on_tick;

							components.buildFromObject(newComponent)
							Bridge.GlobalNode.children[0].edit(replacedComponents.get(component_name), true)

						}

						components.removeNode(component)

						Tab.setUnsaved();
						validate();
					}
				}
			}

		}

		else if (renamedVersions.has(component_name) && compareVersions.compare(fileFormatVersion, renamedVersions.get(component_name), '>=') && compareVersions.compare(renamedVersions.get(component_name), projectTargetVersion, '<=')) {

			const renamedComponent = renamedTo.get(component_name)

			Node.error = {
				is_warning: true,
				show: true,
				message: `${component_name} was renamed from ${renamedVersions.get(component_name)}+ to ${renamedComponent}`,
				fix: {
					run: () => {

						Bridge.GlobalNode.children[0].edit(renamedVersions.get(component_name), true)

						component.editKey(renamedComponent, true)

						if (renamedComponent == 'minecraft:block_light_filter') component.data = 15

						Tab.setUnsaved();
						validate();
					}
				}
			}

		}

	})
}

validate()
