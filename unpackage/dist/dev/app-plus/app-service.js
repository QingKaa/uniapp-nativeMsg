if (typeof Promise !== "undefined" && !Promise.prototype.finally) {
  Promise.prototype.finally = function(callback) {
    const promise = this.constructor;
    return this.then(
      (value) => promise.resolve(callback()).then(() => value),
      (reason) => promise.resolve(callback()).then(() => {
        throw reason;
      })
    );
  };
}
;
if (typeof uni !== "undefined" && uni && uni.requireGlobal) {
  const global = uni.requireGlobal();
  ArrayBuffer = global.ArrayBuffer;
  Int8Array = global.Int8Array;
  Uint8Array = global.Uint8Array;
  Uint8ClampedArray = global.Uint8ClampedArray;
  Int16Array = global.Int16Array;
  Uint16Array = global.Uint16Array;
  Int32Array = global.Int32Array;
  Uint32Array = global.Uint32Array;
  Float32Array = global.Float32Array;
  Float64Array = global.Float64Array;
  BigInt64Array = global.BigInt64Array;
  BigUint64Array = global.BigUint64Array;
}
;
if (uni.restoreGlobal) {
  uni.restoreGlobal(Vue, weex, plus, setTimeout, clearTimeout, setInterval, clearInterval);
}
(function(vue) {
  "use strict";
  function formatAppLog(type, filename, ...args) {
    if (uni.__log__) {
      uni.__log__(type, filename, ...args);
    } else {
      console[type].apply(console, [...args, filename]);
    }
  }
  const { statusBarHeight } = uni.getSystemInfoSync();
  class NativeMsg {
    constructor(item, cb) {
      // 整个区域的宽高
      this.viewStyle = {
        backgroundColor: "rgba(255,255,255,0)",
        top: "0px",
        left: "0px",
        width: "100%",
        // 取图片的高度（带阴影的尺寸）
        height: `${uni.upx2px(239)}px`
      };
      this.item = item;
      this.offsetTop = -statusBarHeight - uni.upx2px(159);
      this.startTop = -statusBarHeight - uni.upx2px(159);
      this.endTop = statusBarHeight;
      this.clientY = 0;
      this.view = null;
      this.bgBitmap = null;
      this.cb = cb || null;
      this.hiding = false;
      this.status = "active";
      this.create();
    }
    // 创建区域以及背景
    create() {
      this.loadBg().then(() => {
        let _view = null;
        _view = new plus.nativeObj.View(`alarmMsg-${this.item.alarmId || "ins"}`, this.viewStyle);
        _view.drawBitmap(
          this.bitmap,
          {},
          { width: this.viewStyle.width, height: this.viewStyle.height, left: 0, top: 0 },
          "alarm-bg"
        );
        _view.interceptTouchEvent(true);
        _view.addEventListener("click", () => {
          if (this.hiding)
            return;
          this.hiding = true;
          this.cb && this.cb({ type: "click", result: this.item });
          this.animationHide();
        });
        _view.addEventListener("touchstart", (res) => {
          this.clientY = res.clientY;
        });
        _view.addEventListener("touchmove", (res) => {
          const { clientY } = res;
          let offsetY = this.clientY - clientY;
          if (offsetY > 25 && !this.hiding) {
            this.hiding = true;
            this.cb && this.cb({ type: "move", result: this.item });
            this.animationHide();
          }
        });
        this.view = _view;
        this.drawInfo();
        this.animationShow();
      });
    }
    // 加载背景图片
    loadBg() {
      this.bitmap = new plus.nativeObj.Bitmap("nativeMsg-bg");
      return new Promise((resolve, reject) => {
        this.bitmap.load(
          "_www/static/alarm-bg.png",
          () => {
            resolve();
          },
          (error) => {
            formatAppLog("log", "at utils/nativeMsg.js:92", " ====> error", error);
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
  function createAlarm(item, cb) {
    return new NativeMsg(item, cb);
  }
  const _export_sfc = (sfc, props) => {
    const target = sfc.__vccOpts || sfc;
    for (const [key, val] of props) {
      target[key] = val;
    }
    return target;
  };
  const _sfc_main$2 = {
    data() {
      return {
        title: "Hello",
        msgList: []
      };
    },
    onLoad() {
    },
    methods: {
      postNewMsg() {
        let alarmId = Date.now();
        let msg = {
          alarmId,
          warningTypeStr: "告警消息",
          projectName: "2023年5月17日",
          description: "十万火急，赶紧处理！！！"
        };
        let alarmIns = createAlarm(msg, (res) => {
          const { type, result } = res;
          let idx = this.msgList.findIndex((it) => result.alarmId === it.item.alarmId);
          if (idx > -1) {
            this.msgList.splice(idx, 1);
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
      hideMsg(alarmId) {
        let idx = this.msgList.findIndex((it) => alarmId === it.item.alarmId);
        this.msgList[idx].hide();
        this.msgList.splice(idx, 1);
      }
    }
  };
  function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "content" }, [
      vue.createElementVNode("image", {
        class: "logo",
        src: "/static/logo.png"
      }),
      vue.createElementVNode("view", { class: "text-area" }, [
        vue.createElementVNode(
          "text",
          { class: "title" },
          vue.toDisplayString($data.title),
          1
          /* TEXT */
        )
      ]),
      vue.createElementVNode("button", {
        onClick: _cache[0] || (_cache[0] = (...args) => $options.postNewMsg && $options.postNewMsg(...args))
      }, "创建消息"),
      vue.createElementVNode("button", {
        onClick: _cache[1] || (_cache[1] = (...args) => $options.toOther && $options.toOther(...args))
      }, "其他页面"),
      vue.createElementVNode("view", { class: "" }, [
        (vue.openBlock(true), vue.createElementBlock(
          vue.Fragment,
          null,
          vue.renderList($data.msgList, (item, index) => {
            return vue.openBlock(), vue.createElementBlock("view", {
              class: "",
              key: index
            }, [
              vue.createTextVNode(
                vue.toDisplayString(index) + " - " + vue.toDisplayString(JSON.stringify(item.item)) + " ",
                1
                /* TEXT */
              ),
              vue.createElementVNode("button", {
                onClick: ($event) => $options.hideMsg(item.item.alarmId)
              }, "hideMsg", 8, ["onClick"])
            ]);
          }),
          128
          /* KEYED_FRAGMENT */
        ))
      ])
    ]);
  }
  const PagesIndexIndex = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["render", _sfc_render], ["__file", "C:/Users/Admin/Documents/HBuilderProjects/nativeMsg/pages/index/index.vue"]]);
  const _sfc_main$1 = {
    __name: "other",
    setup(__props) {
      function back() {
        uni.navigateBack();
      }
      return (_ctx, _cache) => {
        return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
          vue.createElementVNode("view", {
            class: "",
            style: { "padding-top": "200rpx" }
          }, [
            vue.createElementVNode("view", {
              class: "",
              style: { "text-align": "center" }
            }, "Other page"),
            vue.createElementVNode("button", { onClick: back }, "返回")
          ])
        ]);
      };
    }
  };
  const PagesOtherOther = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["__file", "C:/Users/Admin/Documents/HBuilderProjects/nativeMsg/pages/other/other.vue"]]);
  __definePage("pages/index/index", PagesIndexIndex);
  __definePage("pages/other/other", PagesOtherOther);
  const _sfc_main = {
    onLaunch: function() {
      formatAppLog("log", "at App.vue:4", "App Launch");
    },
    onShow: function() {
      formatAppLog("log", "at App.vue:7", "App Show");
    },
    onHide: function() {
      formatAppLog("log", "at App.vue:10", "App Hide");
    }
  };
  const App = /* @__PURE__ */ _export_sfc(_sfc_main, [["__file", "C:/Users/Admin/Documents/HBuilderProjects/nativeMsg/App.vue"]]);
  function createApp() {
    const app = vue.createVueApp(App);
    return {
      app
    };
  }
  const { app: __app__, Vuex: __Vuex__, Pinia: __Pinia__ } = createApp();
  uni.Vuex = __Vuex__;
  uni.Pinia = __Pinia__;
  __app__.provide("__globalStyles", __uniConfig.styles);
  __app__._component.mpType = "app";
  __app__._component.render = () => {
  };
  __app__.mount("#app");
})(Vue);
