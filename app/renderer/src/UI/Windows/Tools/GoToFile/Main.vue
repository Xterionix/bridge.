<template>
	<BaseWindow v-if="shouldRender" windowTitle="Go To File" :isVisible="isVisible" :hasMaximizeButton="false"
		:isFullscreen="false" :width="420" :maxWidth="420" :height="160" :maxHeight="160" @closeWindow="close">
		<v-autocomplete placeholder="Search..." :items="files" :filter="customSearch" @input="openFile" autofocus
			:menu-props="{ maxWidth: 380 }" />
	</BaseWindow>
</template>

<script>
import { GoToFile } from './definition'
import BaseWindow from '../../Layout/Base'
import { loadFiles } from './loadFiles'
import FileSystem from '../../../../FileSystem'
import * as fu from 'fuse.js'

export default {
	name: 'GoToFile',
	components: {
		BaseWindow,
	},
	data: () => GoToFile.getState(),
	computed: {
		files() {
			return loadFiles()
		},
	},

	methods: {
		/**
		 * @todo Order results based on fuzzy search
		 **/
		customSearch(item, queryText) {
			const fuse = new fu.default([item.text.split('/').pop()], { includeScore: true })
			const result = fuse.search(queryText)
			const value = result[0] ? result[0].score < 0.3 : false
			if (result.length > 0) console.warn(result)
			return value
		},
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