<template>
	<view class="content">
		<image class="logo" src="/static/logo.png"></image>
		<view class="text-area">
			<text class="title">{{ title }}</text>
		</view>
		<button @click="postNewMsg">创建消息</button>
		<button @click="toOther">其他页面</button>
		<view class="">
			<view class="" v-for="(item, index) in msgList" :key="index">{{ index }} - {{ JSON.stringify(item.item) }}
                <button @click="hideMsg(item.item.alarmId)">hideMsg</button>
            </view>
		</view>
	</view>
</template>

<script>
import { createAlarm } from "@/utils/nativeMsg.js";
export default {
	data() {
		return {
			title: "Hello",
			msgList: []
		};
	},
	onLoad() {},
	methods: {
		postNewMsg() {
            let alarmId = Date.now()
			let msg = {
				alarmId: alarmId,
				warningTypeStr: "告警消息",
				projectName: "2023年5月17日",
				description: "十万火急，赶紧处理！！！"
			};

			let alarmIns = createAlarm(msg, res => {
				const { type, result } = res;
                let idx = this.msgList.findIndex(it => result.alarmId === it.item.alarmId)
                if (idx > -1) {
                    this.msgList.splice(idx, 1)
                }
				uni.showToast({
					title: `${type === "click" ? "点击了" : "上滑了"}`,
					icon: "none"
				});
			});

			this.msgList.push(alarmIns);
		},
		toOther() {
			uni.navigateTo({
				url: "/pages/other/other"
			});
		},
        hideMsg(alarmId){
            let idx = this.msgList.findIndex(it => alarmId === it.item.alarmId)
            this.msgList[idx].hide()
            this.msgList.splice(idx, 1)
        }
	}
};
</script>

<style>
.content {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
}

.logo {
	height: 200rpx;
	width: 200rpx;
	margin-top: 200rpx;
	margin-left: auto;
	margin-right: auto;
	margin-bottom: 50rpx;
}

.text-area {
	display: flex;
	justify-content: center;
}

.title {
	font-size: 36rpx;
	color: #8f8f94;
}
</style>
