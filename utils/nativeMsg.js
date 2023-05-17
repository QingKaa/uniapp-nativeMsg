const { statusBarHeight } = uni.getSystemInfoSync();
class NativeMsg {
	// 整个区域的宽高
	viewStyle = {
		backgroundColor: "rgba(255,255,255,0)",
		top: "0px",
		left: "0px",
		width: "100%",
		// 取图片的高度（带阴影的尺寸）
		height: `${uni.upx2px(239)}px`
	};
	constructor(item, cb) {
		// 记录内容信息，以供回调使用
		this.item = item;
		// 弹出、消失动画要用
		this.offsetTop = -statusBarHeight - uni.upx2px(159);
		// 上边界
		this.startTop = -statusBarHeight - uni.upx2px(159);
		// 下边界
		this.endTop = statusBarHeight;
		// 上滑关闭要用
		this.clientY = 0;
		// nativeObj.View 实例
		this.view = null;
		// 背景图片
		this.bgBitmap = null;
		// 回调函数
		this.cb = cb || null;
		// 隐藏过程flag，防止重复执行
		this.hiding = false;
		// 标记当前弹窗状态
		this.status = "active";
		this.create();
	}
	// 创建区域以及背景
	create() {
		this.loadBg().then(() => {
			let _view = null;
			// 创建 View区域
			_view = new plus.nativeObj.View(`alarmMsg-${this.item.alarmId || "ins"}`, this.viewStyle);
			// 画背景
			_view.drawBitmap(
				this.bitmap,
				{},
				{ width: this.viewStyle.width, height: this.viewStyle.height, left: 0, top: 0 },
				"alarm-bg"
			);
			// 拦截触摸事件: 开启后 区域内的触摸事件不会透传到下面
			_view.interceptTouchEvent(true);
			// 增加点击事件监听
			_view.addEventListener("click", () => {
				if (this.hiding) return;
				this.hiding = true;
				this.cb && this.cb({ type: "click", result: this.item });
				this.animationHide();
			});
			// 触摸事件监听
			_view.addEventListener("touchstart", res => {
				this.clientY = res.clientY;
			});
			// 触摸事件监听
			_view.addEventListener("touchmove", res => {
				const { clientY } = res;
				let offsetY = this.clientY - clientY;
				if (offsetY > 25 && !this.hiding) {
					this.hiding = true;
					this.cb && this.cb({ type: "move", result: this.item });
					this.animationHide();
				}
			});
			// 保存
			this.view = _view;
			// 画内容
			this.drawInfo();
			// 显示
			this.animationShow();
		});
	}
	// 加载背景图片
	loadBg() {
		// 创建Bitmap图片
		this.bitmap = new plus.nativeObj.Bitmap("nativeMsg-bg");
		// 以Promise方式封装 图片加载过程
		return new Promise((resolve, reject) => {
			// 加载图片, 路径需要注意
			this.bitmap.load(
				"_www/static/alarm-bg.png",
				() => {
					resolve();
				},
				error => {
					console.log(" ====> error", error);
					reject();
				}
			);
		});
	}
	// 画内容
	drawInfo() {
		const { warningTypeStr, projectName, description } = this.item;
		this.view.draw([
			{
				tag: "font",
				id: "mainFont",
				text: warningTypeStr,
				textStyles: { size: `${uni.upx2px(36)}px`, color: "#262626", weight: "bold", align: "left" },
				position: { top: `${uni.upx2px(60)}px`, left: `${uni.upx2px(80)}px`, height: "wrap_content" }
			},
			{
				tag: "font",
				id: "projectFont",
				text: projectName,
				textStyles: { size: `${uni.upx2px(24)}px`, color: "#7B7B7B", align: "right", overflow: "ellipsis" },
				position: {
					top: `${uni.upx2px(60)}px`,
					left: `50%`,
					width: `${uni.upx2px(750 / 2 - 40 - 20)}px`,
					height: "wrap_content"
				}
			},
			{
				tag: "font",
				id: "infoFont",
				text: description,
				textStyles: { size: `${uni.upx2px(28)}px`, color: "#7B7B7B", align: "left", overflow: "ellipsis" },
				position: {
					top: `${uni.upx2px(117)}px`,
					left: `${uni.upx2px(80)}px`,
					width: `${uni.upx2px(670 - 40 - 10)}px`,
					height: "wrap_content"
				}
			}
		]);
	}
	// 简易向下出现动画
	animationShow() {
		this.view.show();
		this.view.setStyle({
			...this.viewStyle,
			top: `${this.offsetTop++}px`
		});
		if (this.offsetTop >= this.endTop) {
			this.status = "active";
			return;
		}
		setTimeout(() => {
			this.animationShow();
		}, 0);
	}
	// 简易向上消失动画
	animationHide() {
		this.view.setStyle({
			...this.viewStyle,
			top: `${this.offsetTop--}px`
		});
		if (this.offsetTop <= this.startTop) {
			this.view.close();
			this.hiding = false;
			this.status = "close";
			return;
		}
		setTimeout(() => {
			this.animationHide();
		}, 0);
	}
	// 获取当前状态
	getStatus() {
		return this.status;
	}
	// 不用动画，直接消失
	hide() {
		this.view.hide();
		this.view.close();
	}
}

// 对外暴露一个创建实例的方法
export function createAlarm(item, cb) {
	return new NativeMsg(item, cb);
}
