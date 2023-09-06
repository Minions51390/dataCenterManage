<!--
    组件说明：此组件为基于element-ui近一步进行样式封装的对话框组件
    参数说明：参数和element-ui保持一致
    插槽说明：
        title插槽：对话框左上角标题
        content插槽：对话框内容部分
        footer插槽：对话框底部
-->
<template>
  <a-modal
    dialogClass="public_dialog"
    :visible.sync="dialogVisible"
    :title="!customTitle ? title : ''"
    :width="width"
    :dialog-style="{ top: top }"
    :destroy-on-close="destroyOnClose"
    :keyboard="closeOnPressEscape"
    @cancel="beforeClose"
    v-bind="$attrs"
  >
    <slot v-if="customTitle" slot="title" name="title"></slot>
    <slot name="content"></slot>
    <div slot="footer" class="footer">
      <slot name="footer"></slot>
    </div>
  </a-modal>
</template>

<script>
export default {
  name: 'pl-dialog',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: ''
    },
    width: {
      type: String,
      default: '50%'
    },
    appendToBody: {
      type: Boolean,
      default: false
    },
    destroyOnClose: {
      type: Boolean
    },
    closeOnPressEscape: {
      type: Boolean,
      default: false
    },
    closeOnClickModal: {
      type: Boolean,
      default: false
    },
    beforeClose: {
      type: Function
    },
    top: {
      type: String,
      default: '15vh'
    },
    customTitle: {
      type: Boolean,
      default: false
    }
  },
  watch: {
    visible(val) {
        this.dialogVisible = val;
    },
    dialogVisible(val) {
        this.$emit('update:visible', val);
    }
  },
  data() {
    return {
        dialogVisible: this.visible
    };
  },
  mounted() {
    this.$nextTick(() => {
        this.opened();
    });
  },
  methods: {
    opened() {
        this.$emit('opened');
    }
  }
};
</script>

<style scoped lang="less">
@deep: ~'>>>';
@{deep} .public_dialog {
  .sentry-modal-header {
    padding: 10px 10px 10px 20px;
    min-height: 24px;
    background: #f6f7fb;
    color: #333;
    font-size: 12px;
  }
  .sentry-modal-header span {
    font-size: 14px;
  }
  .sentry-modal-close-x {
    width: 40px;
    height: 40px;
    line-height: 40px;
}
  .sentry-modal-footer {
    padding: 0;
  }
}
.footer {
  margin: 0 8px 3px 8px;
  padding: 10px 0 10px 6px;
  border-top: 1px solid #f0f0f0;
}
</style>
