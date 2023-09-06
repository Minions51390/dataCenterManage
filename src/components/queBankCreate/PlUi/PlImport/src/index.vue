<template>
  <Dialog
    :visible.sync="dialogVisible"
    v-if="dialogVisible"
    title="批量导入"
    :before-close="handleClose"
    width="70%"
    appendToBody
  >
    <template v-slot:content>
      <a-steps :current="active">
        <a-step title="上传文件"></a-step>
        <a-step title="预览数据"></a-step>
        <a-step title="提交数据"></a-step>
      </a-steps>
      <!--准备数据-->
      <div v-if="active === 0" :style="{marginTop:'16px'}">
        <input
          ref="excel-upload-input"
          class="excel-upload-input"
          type="file"
          accept=".xlsx, .xls"
          @change="handleClick"
        />
        <div class="drop">
          <a-button
            v-if="!hasTemp"
            :loading="loading"
            style="margin-left: 16px"
            size="small"
            type="primary"
            @click="exportTemplate"
          >
            下载模板
          </a-button>
          <span
            v-if="!hasTemp"
            class="export-btn"
            style="color: #1296db; cursor: pointer"
            @click="hasTemp = true"
          >
            (已有模板)
          </span>
          <p v-if="!hasTemp">需下载模板后使用模板文件上传数据!</p>
          <a-button
            v-if="hasTemp"
            :loading="loading"
            style="margin-left: 16px"
            size="small"
            type="primary"
            @click="handleUpload"
          >
            点击上传文件
          </a-button>
          <p v-if="hasTemp">支持.xlsx/.xls/.csv文件，文件最大10M</p>
        </div>
        <div>
          <p style="font-weight: 600">上传说明</p>
          <p style="margin: 5px 0">1.模板文件中表头不能修改，否则可能会导致数据匹配不上。</p>
          <p style="margin: 5px 0; color: red">
            2.数组格式需要使用"||"分隔，例如："一二三||123||abc"，系统会自动转为数组存入。
          </p>
          <a-table
            v-if="templateList.length > 0"
            size="small"
            :data-source="templateList"
            :bordered="true"
            :pagination="false"
            :scroll="{ y: 120 }"
          >
            <a-table-column
              v-for="item of excelAttr.import_header"
              :key="item.key"
              :title="item.label"
              :data-index="item.key"
            >
            </a-table-column>
          </a-table>
        </div>
      </div>
      <!--预览数据-->
      <div v-if="active === 1" style="margin-top: 10px">
        <a-table
          :data-source="preData"
          size="small"
          :row-key="rowKey"
          :bordered="true"
          :pagination="false"
          :scroll="{ y: 340 }"
        >
          <a-table-column key="indexNum" title="序号" width="50">
            <template slot-scope="text, record, index">{{ index + 1 }}</template>
          </a-table-column>
          <a-table-column
            v-for="item of importHeader"
            :key="item.key"
            :title="item.label"
            :data-index="item.key"
            :formatter="formatBool"
          >
          </a-table-column>
        </a-table>
      </div>
      <!--提交数据-->
      <div v-if="active >= 2">
        <a-progress :percent="process"></a-progress>
        <a-table
          v-if="errorList.length > 0"
          size="small"
          :data-source="errorList"
          :bordered="true"
          :pagination="false"
          :scroll="{ y: 400 }"
        >
          <a-table-column key="indexNum" title="序号" :width="100">
            <template slot-scope="text, record, index">{{ index + 1 }}</template>
          </a-table-column>
          <a-table-column key="data" title="数据内容" data-index="data">
            <template slot-scope="data">{{ JSON.stringify(data) }}</template>
          </a-table-column>
          <a-table-column key="reason" title="提示信息" data-index="reason"> </a-table-column>
        </a-table>
        <div v-if="errorList.length === 0" class="import-over">
          <p v-if="process === 100" style="margin-top: 50px; color: #67c23a">导入完成</p>
          <p v-else style="margin-top: 50px; color: #909399">导入中...</p>
        </div>
      </div>
    </template>
    <template v-slot:footer>
      <div>
        <a-button type="primary" size="small" v-if="active === 1" @click="reloadUpdate">
          重新上传
        </a-button>
        <a-button type="primary" size="small" v-if="active === 1" @click="startUpload">
          开始导入
        </a-button>
        <a-button
          v-if="active === 2 && process < 100 && stop === false"
          type="primary"
          size="small"
          @click="importOver"
          >停止上传
        </a-button>
        <a-button
          v-if="active >= 2 && process === 100 && errorList.length > 0 && downloadable"
          type="primary"
          plain
          size="small"
          @click="downLoadErrorData"
          >下载错误数据
        </a-button>
        <a-button
          v-if="active >= 2 && process === 100"
          type="primary"
          size="small"
          @click="importFinish"
          >确定
        </a-button>
      </div>
    </template>
  </Dialog>
</template>

<script>
import * as XLSX from 'xlsx';
import Dialog from '../../PlDialog';
import excel from '../../common/excel.js';

const DEFAULT_LIMIT = 100;
export default {
  name: 'pl-import',
  components: {
    Dialog,
  },
  props: {
    // 必须属性，列表数据导入时的excel配置对象，具体参考confluence文档相关部分： http://172.20.200.191:8003/pages/viewpage.action?pageId=951627547
    excelAttr: {
      type: Object,
      default: () => ({}),
    },
    // 列表数据具体业务自行实现的分片导入的方法，返回一个Promise对象，数据是 { code, msg }
    importList: {
      type: Function,
    },
    // 列表数据导入结束时的回调，一般用于更新当前列表数据
    handleSearch: {
      type: Function,
    },
    // 可选的行数据加工方法，如果没有传入，组件内部有默认的兜底检测逻辑
    rowDealMethod: {
      type: Function,
    },
    // 是否有下载错误日志入口，默认是有
    downloadable: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      // 对话框是否可见
      dialogVisible: false,
      // 当前激活步骤,从 0 开始
      active: 0,
      // 上传成功后的预览数据，最多取前100条
      preData: [],
      // 文件上传中信号
      loading: false,
      // 导入的excel解析后的数据对象，有header 和 results两部分
      excelData: {
        header: null,
        results: null,
      },
      // 每次导入的分片数量上限，默认是100，可通过属性控制
      importLimit: this.excelAttr.import_limit || DEFAULT_LIMIT,
      // 实例数据，暂时没有支持属性干预，后续可以考虑通过属性传入
      templateList: [],
      // 要导入的数据总数
      total: 0,
      // 已处理的导入数据的百分比， 0 ~ 100
      process: 0,
      // 失败日志数据
      errorList: [],
      importColumn: [],
      importHeader: [],
      stop: false,
      // 是否已有模板
      hasTemp: false,
      fileName: '',
    };
  },
  computed: {
    rowKey() {
      let rowKey = '';
      if (this.excelAttr.rowKey) {
        rowKey = this.excelAttr.rowKey;
      } else if (
        Array.isArray(this.excelAttr.import_header) &&
        this.excelAttr.import_header.length > 0
      ) {
        rowKey = this.excelAttr.import_header[0].key;
      } else {
        // to do
      }
      return rowKey;
    },
  },
  methods: {
    /**
     * 展示对话框
     */
    showDialog() {
      this.active = 0;
      this.total = 0;
      this.process = 0;
      this.errorList = [];
      this.stop = false;
      this.hasTemp = false;
      if (this.excelAttr.import_header.length === 0) {
        this.$amessage.warning('导入字段未指定，请联系开发配置！');
        return;
      }
      this.listInit();
      this.dialogVisible = true;
    },

    listInit() {
      this.fileName = this.excelAttr.file_name;
      this.importHeader = this.excelAttr.import_header;
      if (this.importHeader.length > 0) {
        this.importColumn = this.importHeader.map(item => item.key.trim());
      }
    },

    /**
     * 隐藏对话框
     */
    hideDialog() {
      this.dialogVisible = false;
    },
    //终止上传操作
    importOver() {
      if (this.process < DEFAULT_LIMIT) {
        const self = this;
        this.$aconfirm({
          parentContext: this,
          maskClosable: true,
          title: '提示',
          content: '确定终止上传操作？',
          okText: '确认',
          cancelText: '取消',
          onOk() {
            self.dialogVisible = false;
            self.stop = true;
          },
        });
      }
    },
    //导入结束
    importFinish() {
      this.dialogVisible = false;
      this.active = 3;
      this.handleSearch();
    },
    handleClose() {
      const SUCCESS_PROGRESS = 100;
      if (this.active > 1 && this.process < SUCCESS_PROGRESS) {
        const self = this;
        this.$aconfirm({
          parentContext: this,
          maskClosable: true,
          title: '提示',
          content: '关闭窗口上传文件过程将会被取消，是否继续？',
          okText: '确认',
          cancelText: '取消',
          onOk() {
            self.dialogVisible = false;
            self.stop = true;
          },
        });
      } else {
        this.dialogVisible = false;
      }
    },
    /**
     * 重新上传
     */
    reloadUpdate() {
      const self = this;
      this.$aconfirm({
        parentContext: this,
        maskClosable: true,
        title: '提示',
        content: '重新上传数据？',
        okText: '确认',
        cancelText: '取消',
        onOk() {
          self.active--;
        },
      });
    },
    exportTemplate() {
      const aoa = [];
      aoa.push(this.importColumn);
      aoa.push(this.importHeader.map(item => item.label.trim()));
      const sheet = XLSX.utils.aoa_to_sheet(aoa);
      excel.openDownloadDialog(excel.sheet2blob(sheet), `${this.fileName}.xls`);
      this.hasTemp = true;
    },
    /**
     * 开始上传
     */
    startUpload() {
      if (this.total === 0) {
        this.$amessage.warning('文件为空无法继续!');
        return;
      }

      const self = this;
      const END_STEP = 2;
      this.$aconfirm({
        maskClosable: true,
        title: '提示',
        content: '确认数据没有问题？',
        onOk() {
          self.active++;
          if (self.active === END_STEP && self.total > 0) {
            self.excelImport();
          }
        },
      });
    },
    //同步方式上传数据
    async excelImport() {
      let temp = [];
      do {
        const row = this.excelData.results.shift();
        const dealRet = this.rowDeal(row);
        if (dealRet === false) {
          this.active--;
          break;
        }
        if (this.stop === true) {
          break;
        }
        temp = temp.concat(dealRet);
        if (temp.length % this.importLimit === 0 || this.excelData.results.length === 0) {
          const param = {
            data: JSON.stringify([...temp]),
          };
          const res = await this.importList(param);
          const subErrorList = this.getSubErrorList(res, JSON.parse(JSON.stringify([...temp])));
          if (Array.isArray(subErrorList) && subErrorList.length > 0) {
            this.errorList = this.errorList.concat(subErrorList);
          }
          temp = [];
          const percentOffset = 100;
          this.process = Math.floor(
            ((this.total - this.excelData.results.length) / this.total) * percentOffset
          );
        }
      } while (this.excelData.results.length > 0);
      this.active++;
    },
    getSubErrorList(res, subList) {
      const subErrorList = [];
      const { code, msg, result = {} } = res;
      if (code === 0) {
        const { list = [] } = result;
        if (result && list.length > 0) {
          list.forEach(item => {
            const { row, failed_reason } = item;
            subErrorList.push({
              key: item[this.rowKey],
              data: { ...subList[row - 1] },
              reason: failed_reason,
            });
          });
        }
      } else {
        subList.forEach(item => {
          subErrorList.push({
            key: item[this.rowKey],
            data: { ...item },
            reason: msg,
          });
        });
      }
      return subErrorList;
    },
    /**
     * 下载错误数据
     */
    downLoadErrorData() {
      try {
        const fields = this.importHeader.map(item => item.key);
        const labels = this.importHeader.map(item => item.label);
        const list = [
          [...fields, 'errorReason'],
          [...labels, '提示信息'],
        ];
        this.errorList.forEach(item => {
          const data = [];
          const itemData = item.data;
          this.importColumn.forEach(elem => {
            if (itemData && itemData[elem]) {
              if (Array.isArray(itemData[elem])) {
                itemData[elem] = itemData[elem].join('||');
              }
              data.push(itemData[elem]);
            } else {
              data.push('');
            }
          });
          list.push([...data, item.reason]);
        });
        XLSX.writeFile(
          {
            SheetNames: ['result-page'],
            Sheets: {
              'result-page': XLSX.utils.aoa_to_sheet(list),
            },
          },
          `${this.excelAttr.file_name}_错误数据.xlsx`
        );
      } catch (err) {
        this.$amessage.error(`生成文件失败${err.message}`);
      }
    },
    //导入数据处理
    rowDeal(curRow) {
      const row = JSON.parse(JSON.stringify(curRow));
      if (this.rowDealMethod) {
        return this.rowDealMethod(row);
      }
      for (const key in row) {
        if (!Object.prototype.hasOwnProperty.call(row, key)) {
          continue;
        }
        if (this.importColumn.indexOf(key) < 0) {
          this.$amessage.warning(`${key} 字段非法，不允许导入!`);
          return false;
        }
        const column = this.importHeader.find(item => item.key === key);
        if (column.type !== undefined) {
          if (column.type === 'array') {
            row[key] = row[key].toString().split('||');
          }
          if (column.type === 'string') {
            row[key] = String(row[key]);
          }
          if (column.type === 'number') {
            row[key] = row[key] === '' ? null : Number(row[key]);
          }
        }
      }
      return row;
    },
    //解决布尔数据无法展示问题
    formatBool(row, column, value) {
      let switchValue = value;
      //解决数据中存在对象时，链接符号为“.”时无法渲染的问题
      if (value === undefined && column.property.indexOf('.') > -1) {
        switchValue = row[column.property];
      }
      if (switchValue === true) {
        return 'true';
      } else if (switchValue === false) {
        return 'false';
      } else {
        return switchValue;
      }
    },
    handleUpload() {
      this.$refs['excel-upload-input'].click();
    },
    handleClick(e) {
      const { files } = e.target;
      // only use files[0]
      const rawFile = files[0];
      if (!rawFile) {
        return;
      }
      this.upload(rawFile);
    },
    //上传数据
    upload(rawFile) {
      // fix can't select the same excel
      this.$refs['excel-upload-input'].value = null;
      const bitUnitNum = 1024;
      const maxUnitNum = 10;
      const maxSize = bitUnitNum * bitUnitNum * maxUnitNum;
      if (rawFile.size > maxSize) {
        this.$amessage.error('上传文件不能超过10M!');
      } else if (!this.isExcel(rawFile)) {
        this.$amessage.error('只能上传 .xlsx, .xls, .csv 类型的文件！');
      } else {
        this.readerData(rawFile);
      }
    },
    //读取文件内容
    readerData(rawFile) {
      this.loading = true;
      return new Promise(resolve => {
        const reader = new FileReader();
        reader.onload = e => {
          const data = e.target.result;
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const header = this.getHeaderRow(worksheet);
          const results = XLSX.utils.sheet_to_json(worksheet);
          this.generateData({ header, results });
          this.loading = false;
          resolve();
        };
        reader.readAsArrayBuffer(rawFile);
      });
    },
    //赋值操作
    generateData({ header, results }) {
      const previewMaxNum = 100;
      this.excelData.header = header;
      results.shift();
      this.excelData.results = results;
      this.total = results.length;
      if (this.total > previewMaxNum) {
        this.preData = results.slice(0, previewMaxNum);
      } else {
        this.preData = results;
      }
      this.active = 1;
    },
    getHeaderRow(sheet) {
      const headers = [];
      const range = XLSX.utils.decode_range(sheet['!ref']);
      let C;
      const R = range.s.r;
      /* start in the first row */
      for (C = range.s.c; C <= range.e.c; ++C) {
        /* walk every column in the range */
        const cell = sheet[XLSX.utils.encode_cell({ c: C, r: R })];
        /* find the cell in the first row */
        // <-- replace with your desired default
        let hdr = `UNKNOWN ${C}`;
        if (cell && cell.t) {
          hdr = XLSX.utils.format_cell(cell);
        }
        headers.push(hdr);
      }
      return headers;
    },
    isExcel(file) {
      return /\.(xlsx|xls|csv)$/.test(file.name);
    },
  },
};
</script>

<style scoped>
.excel-upload-input {
  display: none;
  z-index: -9999;
}
.drop {
  border: 2px dashed #bbb;
  width: 600px;
  height: 160px;
  margin: 0 auto;
  border-radius: 5px;
  text-align: center;
  color: #bbb;
  position: relative;
}

.drop button {
  margin-top: 50px;
}

.import-over {
  width: 600px;
  line-height: 160px;
  margin: 0 auto;
  border-radius: 5px;
  text-align: center;
  position: relative;
}
</style>
