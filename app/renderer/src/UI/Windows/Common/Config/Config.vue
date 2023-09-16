<template>
	<BaseWindow v-if="shouldRender" :windowTitle="windowTitle" :isVisible="isVisible" :hasMaximizeButton="false"
		:isFullscreen="false" :width="440" :height="320" @closeWindow="onClose">

		<template #default>
			<v-row>
				<v-col cols="6">
					<v-switch v-model="enableholidayfeatures" label="Holiday Creator Features"></v-switch>
				</v-col>
				<v-col cols="6">
					<v-switch v-model="enablecustombiomes" label="Custom Biomes"></v-switch>
				</v-col>
			</v-row>

			<v-row>
				<v-col cols="6">
					<v-switch v-model="enableupcomingcreatorfeatures" label="Upcoming Creator Features"></v-switch>
				</v-col>
				<v-col cols="6">
					<v-switch v-model="enablescripting" label="Beta APIs"></v-switch>
				</v-col>
			</v-row>

			<v-row>
				<v-col cols="6">
					<v-switch v-model="enablemolangfeatures" label="Molang Features"></v-switch>
				</v-col>
				<v-col cols="6">
					<v-switch v-model="enableexperimentalcameras" label="Experimental Cameras"></v-switch>
				</v-col>
			</v-row>
		</template>

		<template #actions>
			<v-spacer />
			<v-btn color="primary" @click="onConfirm">
				<span>Confirm</span>
			</v-btn>
		</template>
	</BaseWindow>
</template>

<script>
import BaseWindow from '../../Layout/Base'

export default {
	name: 'Config',
	components: {
		BaseWindow,
	},
	props: ['currentWindow'],
	data() {
		return this.currentWindow.getState()
	},
	methods: {
		onClose() {
			this.currentWindow.close()
			this.inputValue = ''
		},
		onConfirm() {
			this.currentWindow.close()
			const arr = [this.enableholidayfeatures, this.enablecustombiomes, this.enableupcomingcreatorfeatures, this.enablescripting, this.enablemolangfeatures, this.enableexperimentalcameras]
			this.onConfirmCb(arr)
		},
	},
}
</script>

<style>
.expand_text {
	opacity: 60%;
	padding-top: 26px;
}
</style>
