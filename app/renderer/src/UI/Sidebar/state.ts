/**
 * Reactive vue state for the Sidebar
 */

import Vue from 'vue'
import { ISidebarInstance } from './create'
import { trigger } from '../../AppCycle/EventSystem'
import { getDefaultSidebar } from './setup'

export interface ISidebarState {
	currentState: string | null
	sidebarElements: {
		[uuid: string]: ISidebarInstance
	}
}

export const SidebarState: ISidebarState = Vue.observable({
	currentState: null,
	sidebarElements: {},
})

let lastSelected: ISidebarInstance

export function selectSidebar(findId: string) {
	const sidebar = Object.values(SidebarState.sidebarElements).find(
		({ id }) => id === findId
	)

	if (sidebar && sidebar !== getSelected()) {
		trigger('bridge:toggledSidebar', getSelected(), sidebar.select(), false)
	}
}

export function getSelected() {
	return SidebarState.sidebarElements[SidebarState.currentState]
}

export function setLastSelected(sidebar: ISidebarInstance) {
	lastSelected = sidebar;
}

export function getLastSelected() {
	return lastSelected || getDefaultSidebar()
}
