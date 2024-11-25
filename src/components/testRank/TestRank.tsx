import React from 'react';
import { Table, Pagination, Input, Button, message, Popconfirm, Alert, Modal, Select, Space, DatePicker } from 'antd';
import '../../style/pageStyle/TestRank.less';
import copy from 'clipboard-copy';
import { get, post, baseUrl } from '../../service/tools';
import { getQueryString } from '../../utils';
import { PlusOutlined } from '@ant-design/icons';
import moment from 'moment';
const { Option } = Select;
const { RangePicker } = DatePicker;
const dateFormat = 'YYYY-MM-DD';
const modalDataFormat = 'YYYY-MM-DD HH:mm';

const FunGetDateStr = (p_count: any, nowDate: any) => {
    let dd = nowDate;
    dd.setDate(dd.getDate() + p_count); //获取p_count天后的日期
    let y = dd.getFullYear();
    let m = dd.getMonth() + 1; //获取当前月份的日期
    let d = dd.getDate();
    return y + '-' + m + '-' + d;
};

const mockExamList = [
    {
        examId: '4175d9df-f29c-4a59-819f-d2b0e92b6dcb',
        examName: '1',
        questionPaperName: '初三下册第一次测验',
        creator: '大橙子',
        questionPaperId: '4175d9df-f29c-4a59-819f-d2b0e92b6dcb',
        examTime: '2022-03-19 17:56:43',
        status: 1,
    },
    {
        examId: '4175d9df-f29c-4a59-819f-d2b0e92b6dcb',
        examName: '2',
        questionPaperName: '初三下册第一次测验',
        creator: '大橙子',
        questionPaperId: '4175d9df-f29c-4a59-819f-d2b0e92b6dcb',
        examTime: '2022-03-19 17:56:43',
        status: 2,
    },
    {
        examId: '4175d9df-f29c-4a59-819f-d2b0e92b6dcb',
        examName: '3',
        questionPaperName: '初三下册第一次测验',
        creator: '大橙子',
        questionPaperId: '4175d9df-f29c-4a59-819f-d2b0e92b6dcb',
        examTime: '2022-03-19 17:56:43',
        status: 2,
    },
];

const statusTextList = ['全部', '进行中', '已结束'];

class TestRank extends React.Component {
    state = {
        isVisible: false,
        createExamName: '',
        createExamId: '',
        createStartTime: moment().format(modalDataFormat),
        createEndTime: moment((new Date(FunGetDateStr(7, new Date()) + " 00:00:00") as any)).format(modalDataFormat),
        modalSelPici: 0,
        modalSelClass: [],
        modalClassList: [],
        examType: 'all',
        pageNo: 1,
        pageSize: 20,
        modalPageNo: 1,
        modalPageSize: 5,
        modalColumns: [{
            title: '序号',
            dataIndex: 'key',
            render: (text: any, record: any, index: number) => <div>{index + 1 + (this.state.modalPageNo - 1) * this.state.modalPageSize}</div>,
        },{
            title: '班级名称',
            key: 'describe',
            dataIndex: 'describe',
        },{
            title: '批次',
            key: 'batchName',
            dataIndex: 'batchName',
        }],
        modalAllCount: 0,
        totalCount: 1,
        teacher: [],
        selTeacher: {
            teacherId: '',
            realName: '',
        },
        pici: [],
        selPici: '',
        banji: [],
        selBanji: '',
        query: '',
        queryType: 'examName',
        queryTypeList: [
            {
                type: 'examName',
                name: '考试名称',
            },
            {
                type: 'questionPaperName',
                name: '试卷名称',
            },
            // {
            //     type: 'creator',
            //     name: '创建人',
            // },
            {
                type: 'questionPaperId',
                name: '考试ID',
            },
        ],
        statusList: [
            {
                id: 0,
                name: '全部',
            },
            {
                id: 1,
                name: '进行中',
            },
            {
                id: 2,
                name: '已结束',
            },
        ],
        status: 0,
        sortKey: 'creator',
        sort: 'asc',
        columns1: [
            {
                title: '序号',
                key: 'key',
                render: (text: any, record: any, index: number) => <div>{index + 1 + (this.state.pageNo - 1) * 20}</div>,
            },
            {
                title: '考试名称',
                dataIndex: 'examName',
                key: 'examName',
            },
            {
                title: '试卷名称',
                dataIndex: 'questionPaperName',
                key: 'questionPaperName',
            },
            {
                title: '创建人',
                dataIndex: 'creator',
                key: 'creator',
                sorter: true,
            },
            {
                title: '试卷ID',
                key: 'questionPaperId',
                render: (text: any) => (
                    <div className="edit">
                        <div
                            className="copy"
                            onClick={this.copyIdFn.bind(this, text.questionPaperId)}
                        >
                            <div>{text.questionPaperId}</div>
                        </div>
                    </div>
                ),
            },
            {
                title: '考试起止时间',
                key: 'examStartTime',
                sorter: true,
                render: (text: any) => (
                    <div>
                        <div>{text.examStartTime}</div>
                        <div>-</div>
                        <div>{text.examEndTime}</div>
                    </div>
                ),
            },
            {
                title: '试卷状态',
                key: 'status',
                render: (text: any) => <div>{statusTextList[text.status]}</div>,
            },
            {
                title: '操作',
                key: 'control',
                render: (text: any) => (
                    <div className="edit">
                        {text.status !== 2 ? (
                            <Popconfirm
                                placement="topLeft"
                                title="是否确认删除？删除后无法恢复!"
                                okText="确认"
                                cancelText="取消"
                                onConfirm={this.delExam.bind(this, text.examId)}
                            >
                                <div className="copy">
                                    <div>删除</div>
                                </div>
                            </Popconfirm>
                        ) : (
                            <div className="gray">删除</div>
                        )}
                        <div className="entry" onClick={() => this.jumpMistake(text)}>
                            错题排行
                        </div>
                        <div className="entry" onClick={this.jumpStu.bind(this, text)}>
                            成绩排行
                        </div>
                    </div>
                ),
            },
        ],
        data1: [],
        startDate: moment(new Date(FunGetDateStr(-6, new Date())) as any).format(dateFormat),
        endDate: moment(new Date() as any).format(dateFormat),
    };
    componentWillMount() {
        this.inited();
    }

    async inited() {
        const teacher = await this.getTeacher();
        const selTeacher = teacher.find((item: any) => {
            return item.teacherId === Number(localStorage.getItem('classTeacherId'));
        });
        this.setState({
            teacher,
            selTeacher,
            query: decodeURI(getQueryString().examName || ''),
        }, async () => {
            const pici = await this.getPici(selTeacher.teacherId);
            const banji = await this.getClass(pici[0].batchId);
            this.getModalClass();
            this.setState({
                pici,
                banji,
                selPici: pici[0].batchId,
                selBanji: banji[0].classId,
            }, async () => {
                this.getTest();
            })
        })
    }
    async handleTeacher(val: any) {
        const { teacher } = this.state;
        const selTeacher = teacher.find((item: any) => {
            return item.teacherId === val;
        });
        const res = await this.getPici(val);
        const pici = res[0] ? res[0]?.batchId : '';
        this.setState({
            selTeacher,
            pici: res,
        });
        this.handlePiCi(pici);
    }
    /** 更换批次列表 */
    async handlePiCi(val: any) {
        let res = await this.getClass(val);
        let selBanji = res[1] ? res[1].classId : 0;
        if(!val){
            selBanji = 0
        }
        this.setState({
            selPici: val,
            banji: res,
            selBanji,
        }, async () => {
            this.handleBanji(selBanji);
        });
    }

    /** 更换班级列表 */
    async handleBanji(val: any) {
        this.setState({
            selBanji: val,
        }, async () => {
            this.getTest();
        });
    }

    /** 更换时间 */
    handleDateChange(date: any) {
        this.setState({
            startDate: moment(new Date(date[0]._d) as any).format(dateFormat),
            endDate: moment(new Date(date[1]._d) as any).format(dateFormat)
        }, () => {
            this.getTest();
        });
    }

    /** 更换考试状态 */
    handleStatus(val: any) {
        this.setState(
            {
                status: val,
            },
            () => {
                this.getTest();
            }
        );
    }

    /** query的种类 */
    handleQueryType(val: any) {
        this.setState({
            queryType: val,
        }, () => {
            this.getTest();
        });
    }

    /** 搜索 */
    onTestQueryChange(event: any) {
        this.setState({
            query: event.target.value,
        }, ()=>{
            this.getTest();
        });
    }

    /** 排序更换触发 */
    tableChange(pagination: any, filters: any, sorter: any, extra: any) {
        if (sorter?.columnKey) {
            const sort = (sorter?.order || '').replace('end', '');
            this.setState(
                {
                    sortKey: sorter?.columnKey,
                    sort,
                },
                () => {
                    this.getTest();
                }
            );
        }
        console.log(pagination, filters, sorter, extra);
    }

    jumpStu(text: any) {
        const { examId } = text;
        window.location.href = `${window.location.pathname}#/app/test/testRank/stuRank?examId=${examId}`;
    }

    jumpMistake = (text: any) => {
        const { examId } = text;
        window.location.href = `${window.location.pathname}#/app/test/testRank/mistakeRank?examId=${examId}`;
    };

    /** 获取教师列表 */
    async getTeacher() {
        let res = await get({ url: baseUrl + `/api/v1/structure/teacher/list` });
        const teacher = res?.data || [];
        teacher.unshift({
            realName: '全部',
            teacherId: 0,
        });
        return teacher;
    }

    /** 获取批次列表 */
    async getPici(teacherId: any) {
        let res = await get({
            url: `${baseUrl}/api/v1/structure/batch/list?teacherId=${teacherId}`,
        });
        const pici = res.data || [];
        pici.unshift({
            describe: '全部',
            batchId: 0,
        });
        return pici;
    }

    /** 获取班级列表 */
    async getClass(pici: any) {
        const { selTeacher } = this.state;
        let res = await get({
            url: baseUrl + `/api/v1/structure/class/list?teacherId=${selTeacher.teacherId}&batchId=${pici}&pageNo=1&pageSize=99999`,
        });
        const banji = res?.data?.classList ?? [];
        banji.unshift({
            classCode: '',
            classId: 0,
            createDate: '',
            describe: '全部',
            studentCount: 0,
        });
        return banji;
    }

    /** 获取成绩列表 */
    async getTest() {
        const { pageNo, selTeacher, selPici, selBanji, queryType, query, sortKey, sort, status, startDate, endDate } = this.state;
        let res = await get({
            url: `${baseUrl}/api/v1/exam/list`,
            config:{
                params:{
                    teacherId: selTeacher.teacherId,
                    batchId: selPici,
                    classId: selBanji,
                    query,
                    queryType,
                    status,
                    examStartDate: startDate,
                    examEndDate: endDate,
                    pageNo,
                    pageSize: 20,
                    sortKey,
                    sort,
                }
            }
        });
        const examList = res?.data?.examList || [];
        const totalCount = res?.data?.totalCount;
        this.setState({
            data1: examList,
            totalCount,
        });
    }

    /** 点击搜索按钮 */
    clickSearch() {
        this.setState(
            {
                pageNo: 1,
            },
            () => {
                this.getTest();
            }
        );
    }

    /** 更换页面 */
    nowPagChange(val: any) {
        this.setState(
            {
                pageNo: val,
            },
            async () => {
                /** 更新数据 */
                this.getTest();
            }
        );
    }

    /** 复制函数 */
    copyIdFn(id: any) {
        copy(id)
            .then(() => {
                message.success('复制成功');
            })
            .catch(() => {
                message.error('复制失败');
            });
    }

    /** 删除考试 */
    async delExam(id: any) {
        let res = await post({ 
            url: baseUrl + '/api/v1/exam/delete',
            data: {
                examId:id
            },
        });
        console.log(res);
        this.getTest();
    }

    // 新建弹窗点击
    showCreateModal(val:any){
        this.setState({
            isVisible: true
        })
    }

    async handleCreateOk(val:any){
        const {
            createExamName,
            createExamId,
            createStartTime,
            createEndTime,
            modalSelClass,
        } = this.state;
        if(!createExamName || !createExamId || !createStartTime || !createEndTime || modalSelClass.length === 0){
            message.error('请填写新建考试的必要信息');
            return
        }
        let res = await post({
            url: `${baseUrl}/api/v1/exam/bulk`,
            data: {
                examName: createExamName,
                questionPaperId: createExamId,
                examStartTime: createStartTime,
                examEndTime: createEndTime,
                classList: modalSelClass,
            },
        });
        if(res.state === 0){
            message.success('发布考试任务成功');
            this.setState({
                isVisible: false,
                createExamName: '',
                createExamId: '',
                createStartTime: moment().format(modalDataFormat),
                createEndTime: moment((new Date(FunGetDateStr(7, new Date()) + " 00:00:00") as any)).format(modalDataFormat),
                modalSelPici: 0,
            })
            this.getTest()
        }else{
            message.error(`发布考试任务失败:${res.msg}`);
        }
    }
    handleCreateCancel(val:any){
        this.setState({
            isVisible: false
        })
    }

    onCreateExamNameChange(event:any){
        this.setState({
            createExamName: event.target.value
        })
    }

    oncreateExamIdChange(event:any){
        this.setState({
            createExamId: event.target.value
        })
    }

    handleModalPiCiChange(val:any){
        this.setState({
            modalSelPici: val,
        }, ()=>{
            this.getModalClass();
        });
    }

    async getModalClass() {
        const { selTeacher, modalPageNo, modalPageSize, modalSelPici } = this.state;
        let res = await get({ url: baseUrl + `/api/v1/structure/class/list?teacherId=${selTeacher.teacherId}&batchId=${modalSelPici}&category=sc&pageNo=${modalPageNo}&pageSize=${modalPageSize}` });
        const list = res?.data?.classList ?? [];
        list.map((item:any) => item.key = item.classId)
        console.log('list', list)
        this.setState({
            modalClassList: res?.data?.classList ?? [],
            modalAllCount: res?.data?.totalCount
        })
    }

    onCreateStartTimeChange(date: any, dateString: any) {
        this.setState({
            createStartTime: dateString,
        });
    }
    onCreateEndTimeChange(date: any, dateString: any){
        this.setState({
            createEndTime: dateString,
        });
    }

    handleModalSelClassChange(selectedRowKeys:any, selectedRows:any){
        console.log('handleModalSelClassChange', selectedRowKeys, selectedRows)
        this.setState({
            modalSelClass: selectedRowKeys
        })
    }

    modalNowPagChange(val: any) {
        this.setState(
            {
                modalPageNo: val,
            },
            () => {
                this.getModalClass()
            }
        );
    }

    render() {
        const {
            columns1,
            data1,
            pageNo,
            totalCount,
            teacher,
            selTeacher,
            selPici,
            pici,
            selBanji,
            banji,
            query,
            queryType,
            queryTypeList,
            statusList,
            status,
            isVisible,
            createExamName,
            createExamId,
            createStartTime,
            createEndTime,
            modalSelPici,
            modalSelClass,
            modalPageNo,
            modalPageSize,
            modalColumns,
            modalClassList,
            modalAllCount,
        } = this.state;
        return (
            <div className="paper-rank">
                <div className="header">
                    <div className="fir">已发布考试/考试成绩</div>
                    <div className="sec">
                        已发布考试/考试成绩
                        <div onClick={this.showCreateModal.bind(this)}>
                            <Button className="gap-30" type="primary" icon={<PlusOutlined />}>
                                发布考试
                            </Button>  
                        </div>
                    </div>
                </div>
                <div className="body">
                    <div className="zero">
                        <div className="left">
                            <Input.Group compact>
                                <Select
                                    defaultValue={queryType}
                                    value={queryType || '请选择'}
                                    onChange={this.handleQueryType.bind(this)}
                                >
                                    {queryTypeList.map((item: any) => (
                                        <Option value={item.type} key={item.type}>
                                            {item.name}
                                        </Option>
                                    ))}
                                </Select>
                                <Input
                                    style={{ width: '240px' }}
                                    placeholder="待输入"
                                    value={query}
                                    onChange={this.onTestQueryChange.bind(this)}
                                />
                            </Input.Group>
                            {/* <Button
                                className="gap-30"
                                type="primary"
                                onClick={this.clickSearch.bind(this)}
                            >
                                搜索
                            </Button> */}
                        </div>
                        <div className="right">
                            <span className="span3">试卷状态:</span>
                            <Select
                                defaultValue="请选择"
                                style={{ width: 140 }}
                                value={
                                    status ||
                                    (statusList[0] && (statusList[0] as any).name) ||
                                    '请选择'
                                }
                                onChange={this.handleStatus.bind(this)}
                            >
                                {statusList.map((item: any) => (
                                    <Option key={item.id} value={item.id}>
                                        {item.name}
                                    </Option>
                                ))}
                            </Select>
                        </div>
                    </div>
                    <div className="fir">
                        <div className="select-box">
                            <span className="span">执教教师:</span>
                            <Select
                                defaultValue="请选择"
                                style={{ width: 180 }}
                                value={
                                    selTeacher?.realName ||
                                    (teacher[0] && (teacher[0] as any).realName) ||
                                    '请选择'
                                }
                                onChange={this.handleTeacher.bind(this)}
                            >
                                {teacher.map((item: any) => (
                                    <Option key={item.teacherId} value={item.teacherId}>
                                        {item.realName}
                                    </Option>
                                ))}
                            </Select>
                        </div>
                        <div className="select-box">
                            <span className="span  span10">学员批次:</span>
                            <Select
                                defaultValue="请选择"
                                style={{ width: 180 }}
                                value={selPici || (pici[0] && (pici[0] as any).describe) || '请选择'}
                                onChange={this.handlePiCi.bind(this)}
                            >
                                {pici.map((item: any) => (
                                    <Option key={item.batchId} value={item.batchId}>
                                        {item.describe}
                                    </Option>
                                ))}
                            </Select>
                        </div>
                        <div className="select-box">
                            <span className="span span10">班级:</span>
                            <Select
                                defaultValue="请选择"
                                style={{ width: 180 }}
                                value={selBanji || (banji[0] && (banji[0] as any).describe) || '请选择'}
                                onChange={this.handleBanji.bind(this)}
                            >
                                {banji.map((item: any) => (
                                    <Option key={item.classId} value={item.classId}>
                                        {item.describe}
                                    </Option>
                                ))}
                            </Select>
                        </div>
                        <div className="select-box">
                            <span className="span span10">时间:</span>
                            <RangePicker
                                defaultValue={[
                                    moment(new Date(FunGetDateStr(-6, new Date())), dateFormat),
                                    moment(new Date(), dateFormat),
                                ]}
                                onChange={this.handleDateChange.bind(this)}
                                format={dateFormat}
                            />
                        </div>
                    </div>
                    <div className="thr">
                        <Table
                            columns={columns1}
                            dataSource={data1}
                            pagination={false}
                            size={'middle'}
                            bordered={false}
                            onChange={this.tableChange.bind(this)}
                            rowKey={record => record.examId}
                        />
                    </div>
                    <div className={ totalCount > 20 ? 'pag' : 'display-none'}>
                        <Pagination
                            defaultCurrent={1}
                            pageSize={20}
                            current={pageNo}
                            total={totalCount}
                            onChange={this.nowPagChange.bind(this)}
                        />
                    </div>
                </div>
                <Modal
                    width={'680px'}
                    title="发布考试"
                    visible={isVisible}
                    cancelText="取消"
                    okText="确定"
                    onOk={this.handleCreateOk.bind(this)}
                    onCancel={this.handleCreateCancel.bind(this)}
                >
                    <div className="exam-module-area">
                        <span className="span">考试名称:</span>
                        <Input
                            className="gap-8"
                            placeholder="请输入考试名称"
                            value={createExamName}
                            onChange={this.onCreateExamNameChange.bind(this)}
                            maxLength={200}
                        />
                    </div>
                    <div className="exam-module-area exam-module-area2">
                        <div className="left">
                            <span className="span span1">试卷ID:</span>
                            <Input
                                className="gap-8"
                                style={{ width: 150 }}
                                placeholder="请输入试卷ID"
                                value={createExamId}
                                onChange={this.oncreateExamIdChange.bind(this)}
                                maxLength={200}
                            />
                        </div>
                    </div>
                    <div className="exam-module-area exam-module-area2">
                        <div className="left">
                            <span className="span span2">开始时间:</span>
                            <Space direction="vertical" size={12}>
                                <DatePicker
                                    showTime
                                    defaultValue={moment(createStartTime, modalDataFormat)}
                                    format={modalDataFormat}
                                    onChange={this.onCreateStartTimeChange.bind(this)}
                                />
                            </Space>
                        </div>
                        <div className="right">
                            <span className="span span2">截止时间:</span>
                            <Space direction="vertical" size={12}>
                                <DatePicker
                                    showTime
                                    defaultValue={moment(createEndTime, modalDataFormat)}
                                    format={modalDataFormat}
                                    onChange={this.onCreateEndTimeChange.bind(this)}
                                />
                            </Space>
                        </div>
                    </div>
                    <div className="exam-divider" />
                    <div className="exam-module-area">
                        <span className="span">学员批次:</span>
                        <Select
                            defaultValue="请选择"
                            style={{ width: 180 }}
                            value={modalSelPici || (pici[0] && (pici[0] as any).describe) || '请选择'}
                            onChange={this.handleModalPiCiChange.bind(this)}
                        >
                            {pici.map((item: any) => (
                                <Option key={item.batchId} value={item.batchId}>
                                    {item.describe}
                                </Option>
                            ))}
                        </Select>
                    </div>
                    <Alert
                        message={`已选择${modalSelClass.length}项`}
                        type="info"
                        showIcon
                        action={
                            <Button
                                type="link"
                                onClick={() => this.setState({
                                    modalSelClass: [],
                                })}
                            >
                                清空
                            </Button>
                        }
                    />
                    <div className="exam-module-table">
                        <Table
                            columns={modalColumns}
                            dataSource={modalClassList}
                            pagination={false}
                            size={'middle'}
                            bordered={false}
                            rowSelection={{
                                type: 'checkbox',
                                selectedRowKeys: modalSelClass,
                                preserveSelectedRowKeys: true,
                                onChange: this.handleModalSelClassChange.bind(this),
                            }}
                        />
                    </div>
                    <div className="exam-module-pag">
                        <Pagination
                            defaultCurrent={1}
                            pageSize={modalPageSize}
                            current={modalPageNo}
                            total={modalAllCount}
                            onChange={this.modalNowPagChange.bind(this)}
                        />
                    </div>
                </Modal>
            </div>
        );
    }
}

export default TestRank;
