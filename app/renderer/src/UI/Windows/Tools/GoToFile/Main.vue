<template>
	<BaseWindow v-if="shouldRender" windowTitle="Go To File" :isVisible="isVisible" :hasMaximizeButton="false"
		:isFullscreen="false" :width="420" :maxWidth="420" :height="160" :maxHeight="160" @closeWindow="close">
		<v-autocomplete placeholder="Search..." :items="files" :no-filter=true @input="openFile" :search-input.sync="query"
			autofocus :menu-props="{ maxWidth: 380 }" />
	</BaseWindow>
</template>

<script>
import { GoToFile } from './definition'
import BaseWindow from '../../Layout/Base'
import { loadFiles } from './loadFiles'
import FileSystem from '../../../../FileSystem'
import * as fuse from 'fuse.js'

export default {
	name: 'GoToFile',
	components: {
		BaseWindow,
	},
	data() {
		return {
			query: ''
		}
	},
	computed: {
		files() {
			const arr = loadFiles()

			if (!this.query) return arr;

			const f = new fuse.default(arr.map(x => ({ fileName: x.text.split('/').pop(), path: x.text, value: x.value })), { includeScore: false, keys: [{ name: 'fileName', weight: 0.7 }, { name: 'path', weight: 0.3 }], includeMatches: true, ignoreLocation: true, distance: 100 })
			const result = f.search(this.query)

			if (result.length > 0) return result.map(x => ({ text: x.item.path, value: x.item.value }))

			return arr;
		},
		shouldRender() {
			return GoToFile.getState().shouldRender
		},
		isVisible() {
			return GoToFile.getState().isVisible
		}
	},

	methods: {
		close() {
			GoToFile.close()
		},
		openFile(filePath) {
			FileSystem.open(filePath)
			GoToFile.close()
		},
	},
}
</script>