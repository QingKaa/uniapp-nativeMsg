<!--
 * @Description: 
 * @Author: 
 * @Date: 
 * @LastEditors: 
 * @LastEditTime: 
-->
<template>
	<view class="container">
		<view class="" style="padding-top: 200rpx;">
			<view class="" style="text-align: center;">Other page</view>
			<button @click="back">返回</button>
		</view>
	</view>
</template>

<script setup>
import { ref, reactive } from "vue";
import { onLoad } from "@dcloudio/uni-app";

function back() {
	uni.navigateBack();
}
</script>

<style lang="scss" scoped></style>
