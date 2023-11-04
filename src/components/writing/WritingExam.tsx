import React from 'react';
import { Row, Col, Tabs, Popconfirm, message, Space, DatePicker, Radio, Modal, Input, Button, Table, Select, Pagination, Tooltip } from 'antd';
import { PlusOutlined, InfoCircleOutlined } from '@ant-design/icons';
import '../../style/pageStyle/WritingExam.less';
import { get, post, baseUrl } from '../../service/tools';
import moment from 'moment';
const { Option } = Select;
const dateFormat = 'YYYY-MM-DD HH:mm:ss';
const FunGetDateStr = (p_count: any, nowDate: any) => {
    let dd = nowDate;
    dd.setDate(dd.getDate() + p_count);//获取p_count天后的日期 
    let y = dd.getFullYear();
    let m = dd.getMonth() + 1;//获取当前月份的日期 
    let d = dd.getDate();
    return y + "-" + m + "-" + d;
};
const content1 = (
    <div className="popColor">
        <div>测试：学生提交作文后，需老师逐一审阅并发布成绩。</div>
        <div>练习：学生未提交作文前，有三次机会修改作文并使用 AI 智能批改功能对作文内容完善。</div>
    </div>
);
class writingExam extends React.Component {
    state = {
        // 筛选
        query: '',
        queryType: 'examName',
        queryTypeList: [
            {
                type: 'examName',
                name: '任务名称',
            },
            {
                type: 'writingName',
                name: '作文名称',
            },
            {
                type: 'writingCode',
                name: '作文ID',
            },
            {
                type: 'creator',
                name: '创建人',
            },
        ],
        teacher: [],
        selTeacher: {
            teacherId: 0,
            realName: '',
        },
        pici: [],
        selPici: '',
        banji: [],
        selBanji: '',
        semester: [],
        selSemester: [],
        status: 0,
        statusList: [{
            key: 0,
            value: '全部',
        },{
            key: 1,
            value: '进行中',
        },{
            key: 2,
            value: '已结束',
        }],
        examType: 'all',
        examTypeList: [{
            key: 'all',
            value: '全部',
        },{
            key: 'practice',
            value: '练习',
        },{
            key: 'test',
            value: '测验',
        }],
        // 列表
        pageNo: 1,
        pageSize: 20,
        allCount: 1,
        columns1: [
            {
                title: '序号',
                dataIndex: 'key',
                render: (text: any, record: any, index: number) => <div>{index + 1 + (this.state.pageNo - 1) * 20}</div>,
            },
            {
                title: '作文名称',
                key: 'name',
                textWrap: 'ellipsis',
                ellipsis: true,
                render: (text: any, record: any, index: number) => (
                    <div className="writing-exam-box">
                        <div className="box-name">{text.name}</div>
                        <div className="box-title">{text.title}</div>
                    </div>
                ),
            },
            {
                title: '创建人',
                dataIndex: 'creator',
                key: 'creator',
            },
            {
                title: '任务类型',
                key: 'examType',
                render: (text: any, record: any, index: number) => <div>{text.examType === 'practice' ? '练习' : '测验'}</div>,
            },
            {
                title: '作文ID',
                dataIndex: 'writingCode',
                key: 'writingCode',
            },
            {
                title: '班级',
                dataIndex: 'className',
                key: 'className',
            },
            {
                title: '阶段',
                dataIndex: 'semesterName',
                key: 'semesterName',
            },
            {
                title: '考试时间',
                dataIndex: 'startTime',
                key: 'startTime',
            },
            {
                title: '作文状态',
                key: 'status',
                render: (text: any, record: any, index: number) => <div>{text.status === 2 ? '已结束' : '进行中'}</div>,
            },
            {
                title: '操作',
                render: (text: any) => (
                    <div className="edit">
                        <Popconfirm
                            key={text.key}
                            placement="top"
                            title="您确定删除该任务么？"
                            onConfirm={this.handleDeleteClick.bind(this, text.examId)}
                            okText="确认"
                            cancelText="取消"
                        >
                            <div className="delete">删除</div>
                        </Popconfirm>
                        <div className="line">|</div>
                        <div className="rank" onClick={this.handleRankClick.bind(this, text.examId)}>成绩排行</div>
                    </div>
                ),
            },
        ],
        data1: [],
        sort: '',
        sortKey: '',
        // 对话框
        isVisible: false,
        createExamName: '',
        createWritingId: '',
        createExamType: 'practice',
        createStartTime: moment().format(dateFormat),
        createEndTime: (new Date(FunGetDateStr(7, new Date()) + " 00:00:00") as any).format('yyyy-MM-dd'),
        modalSelPici: 0,
        modalSelClass: [],
        modalClassList: [],
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
        modalPageNo: 1,
        modalPageSize: 5,
        modalAllCount: 0,
    };
    componentWillMount() {
        this.inited();
    }
    async inited() {
        const teacher = await this.getTeacher();
        const selTeacher = teacher.find((item:any) => {
            return item.teacherId === Number(localStorage.getItem("classTeacherId"))
        });
        this.setState(
            {
                teacher,
                selTeacher,
            },
            async () => {
                const pici = await this.getPici(selTeacher.teacherId);
                const banji = await this.getClass(pici[0].batchId || 0);
                this.getModalClass();
                this.setState({
                    pici,
                    banji,
                    selPici: pici[0].batchId,
                    selBanji: banji[0].classId,
                }, async () => {
                    const semester = await this.getSemester(banji[0].classId || 0);
                    const selSemester = [0]
                    this.setState({
                        semester,
                        selSemester,
                    }, () => {
                        this.getExamList()
                    });
                })
            }
        );
    }
    async getTeacher() {
        let res = await get({ url: baseUrl + `/api/v1/structure/teacher/list`});
        const teacher = res?.data || [];
        teacher.unshift({
            realName: '全部',
            teacherId: 0,
        });
        return teacher;
    }
    async getPici(teacherId: any) {
        const res = await get({ url: `${baseUrl}/api/v1/structure/batch/list?teacherId=${teacherId}`});
        const pici = res.data || [];
        pici.unshift({
            describe: '全部',
            batchId: 0,
        });
        return pici;
    }
    async getClass(pici: any) {
        const { selTeacher } = this.state;
        let res = await get({ url: baseUrl + `/api/v1/structure/class/list?teacherId=${selTeacher.teacherId}&batchId=${pici}&pageNo=1&pageSize=99999` });
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
    async getSemester(classId: any){
        const {selPici, selTeacher} = this.state
        let res = await get({
            url: baseUrl + `/api/v1/structure/semester/list?teacherId=${selTeacher.teacherId}&batchId=${selPici}&classId=${classId}`
        })
        const semester = res?.data || [];
        semester.unshift({
            isCurrent: false,
            semesterId: 0,
            semesterName: '全部',
        });
        return semester;
    }
    async getExamList(){
        const {query, queryType, status, examType, selTeacher, selPici, selBanji, selSemester, pageNo, pageSize, sort, sortKey} = this.state;
        const res = await get({
            url: baseUrl + `/api/v1/writing-exam/list?teacherId=${selTeacher.teacherId}&batchId=${selPici}&classId=${selBanji}&semesters=${JSON.stringify(selSemester)}&pageNo=${pageNo}&pageSize=${pageSize}&query=${query}&queryType=${queryType}&status=${status}&examType=${examType}`
        })
        this.setState({
            data1: res?.data?.data ?? [],
            allCount: res?.data?.totalCount,
        }) 
    }
    async handleTeacher (val:any){
        const { teacher } = this.state;
        const selTeacher = teacher.find((item:any) => {
            return item.teacherId === val
        });
        const res = await this.getPici(val);
        const pici = res[0] ? res[0]?.batchId : '';
        this.setState({
            selTeacher,
            pici: res,
        });
        this.handlePiCi(pici);
    }
    async handlePiCi(val: any) {
        const res = await this.getClass(val);
        let selBanji = res[1] ? res[1].classId : 0;
        if(!val){
            selBanji = 0
        }
        this.setState({
            selPici: val,
            banji: res,
            selBanji,
        }, async () => {
            this.handleBanji(selBanji)
        });
    }
    async handleBanji(val: any) {
        const semester = await this.getSemester(val);
        let selSemester = semester.length > 0 ? [semester.find((item: any)=>item.isCurrent)?.semesterId ?? 0] : []
        if(!val){
            selSemester = [0]
        }
        this.setState({
            selBanji: val,
            semester,
            selSemester,
        }, async () => {
            this.handleSemester(selSemester);
        });
    }
    async handleSemester(val: any) {
        this.setState({
            selSemester: val,
        }, ()=>{
            this.getExamList()
        });
    }
    // 搜索类型切换
    handleQueryType(val:any){
        this.setState({
            queryType: val
        })
    }
    // 搜索关键字修改
    searchQueryChange(event:any){
        this.setState({
            query: event.target.value
        })
    }
    // 搜索
    clickSearch(val:any){
        this.getExamList()
    }
    // 筛选-作文状态更改
    handleStatusChange(val:any){
        this.setState({
            status: val,
        }, ()=>{
            this.getExamList()
        })
    }
    // 任务类型更改
    handleExamTypeChange(val:any){
        this.setState({
            examType: val,
        }, ()=>{
            this.getExamList()
        })
    }
    // 删除任务
    async handleDeleteClick(val:any){
        console.log('handleDeleteClick', val)
        let res = await post({
            url: `${baseUrl}/api/v1/writing-exam/delete`,
            data: {
                examId: val
            }
        });
        if(res){
            this.getExamList()
        }else{
            message.error(`删除任务失败:${res.msg}`);
        }
    }
    handleRankClick(val:any){
        window.location.href = `${window.location.pathname}#/app/writing/examRank?examId=${val}`
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
            createWritingId,
            createExamType,
            createStartTime,
            createEndTime,
            modalSelClass,
        } = this.state;
        if(!createExamName || !createWritingId || !createExamType || !createStartTime || !createEndTime || modalSelClass.length === 0){
            message.error('请填写新建作文任务的必要信息');
            return
        }
        let res = await post({
            url: `${baseUrl}/api/v1/writing-exam/`,
            data: {
                name: createExamName,
                writingId: createWritingId,
                startTime: createStartTime,
                endTime: createEndTime,
                classList: modalSelClass,
                examType: createExamType,
            },
        });
        if(res.state === 0){
            message.success('发布作文任务成功');
            this.setState({
                isVisible: false,
                createExamName: '',
                createWritingId: '',
                createExamType: 'practice',
                createStartTime: moment().format(dateFormat),
                createEndTime: (new Date(FunGetDateStr(7, new Date()) + " 00:00:00") as any).format('yyyy-MM-dd'),
                modalSelPici: 0,
                modalSelClass: [],
                modalClassList: [],
            })
            this.getExamList()
        }else{
            message.error(`发布作文任务失败:${res.msg}`);
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
    onCreateWritingIdChange(event:any){
        this.setState({
            createWritingId: event.target.value
        })
    }
    onCreateExamTypeChange(event:any){
        this.setState({
            createExamType: event.target.value
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
    handleModalPiCiChange(val:any){
        this.setState({
            modalSelPici: val,
        }, ()=>{
            this.getModalClass();
        });
    }
    handleModalSelClassChange(selectedRowKeys:any, selectedRows:any){
        console.log('handleModalSelClassChange', selectedRowKeys, selectedRows)
        this.setState({
            modalSelClass: selectedRowKeys
        })
    }
    async getModalClass() {
        const { selTeacher, modalPageNo, modalPageSize, modalSelPici } = this.state;
        let res = await get({ url: baseUrl + `/api/v1/structure/class/list?teacherId=${selTeacher.teacherId}&batchId=${modalSelPici}&pageNo=${modalPageNo}&pageSize=${modalPageSize}` });
        const list = res?.data?.classList ?? [];
        list.map((item:any) => item.key = item.classId)
        console.log('list', list)
        this.setState({
            modalClassList: res?.data?.classList ?? [],
            modalAllCount: res?.data?.totalCount
        })
    }
    nowPagChange(val: any) {
        this.setState(
            {
                pageNo: val,
            },
            () => {
                this.getExamList();
            }
        );
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
            teacher,
            selTeacher,
            pici,
            selPici,
            banji,
            selBanji,
            semester,
            selSemester,
            columns1,
            data1,
            pageNo,
            allCount,
            status,
            statusList,
            examType,
            examTypeList,
            query,
            queryType,
            queryTypeList,
            isVisible,
            createExamName,
            createWritingId,
            createExamType,
            createStartTime,
            createEndTime,
            modalSelPici,
            modalSelClass,
            modalClassList,
            modalColumns,
            modalPageNo,
            modalPageSize,
            modalAllCount,
        } = this.state;
        return (
            <div className="writing-exam-wrapper">
                <div className="header">
                    <div className="fir">已发布作文</div>
                    <div className="sec">
                        已发布作文列表
                        <div onClick={this.showCreateModal.bind(this)}>
                            <Button className="gap-30" type="primary" icon={<PlusOutlined />}>
                                发布任务
                            </Button>  
                        </div>
                    </div>
                </div>
                <div className="body">
                    <div className="fir">
                        <Input.Group compact>
                            <Select
                                defaultValue={queryType}
                                value={queryType || '请选择'}
                                onChange={this.handleQueryType.bind(this)}
                            >
                                {queryTypeList.map((item: any) => (
                                    <Option value={item.type} key={item.classId}>
                                        {item.name}
                                    </Option>
                                ))}
                            </Select>
                            <Input
                                style={{ width: '240px' }}
                                placeholder="请输入搜索内容"
                                value={query}
                                onChange={this.searchQueryChange.bind(this)}
                            />
                        </Input.Group>
                        <Button
                            className="gap-30"
                            type="primary"
                            onClick={this.clickSearch.bind(this)}
                        >
                            搜索
                        </Button>
                        <span className="span span1">作文状态</span>
                        <span className="semicolon">:</span>
                        <Select
                            style={{ width: 180 }}
                            value={ status }
                            onChange={this.handleStatusChange.bind(this)}
                        >
                            {statusList.map((item: any) => (
                                <Option key={item.key} value={item.key}>
                                    {item.value}
                                </Option>
                            ))}
                        </Select>
                        <span className="span span2">任务类型</span>
                        <span className="semicolon">:</span>
                        <Select
                            defaultValue="请选择"
                            style={{ width: 180 }}
                            value={ examType || '请选择' }
                            onChange={this.handleExamTypeChange.bind(this)}
                        >
                            {examTypeList.map((item: any) => (
                                <Option key={item.key} value={item.key}>
                                    {item.value}
                                </Option>
                            ))}
                        </Select>
                    </div>
                    <div className="sec">
                        <div>
                            <span className="span">执教教师</span>
                            <span className="semicolon">:</span>
                            <Select
                                defaultValue="请选择"
                                style={{ width: 180 }}
                                value={selTeacher?.realName || (teacher[0] && (teacher[0] as any).realName) || '请选择'}
                                onChange={this.handleTeacher.bind(this)}
                            >
                                {teacher.map((item: any) => (
                                    <Option key={item.teacherId} value={item.teacherId}>
                                        {item.realName}
                                    </Option>
                                ))}
                            </Select>
                        </div>
                        <div>
                            <span className="span">学员批次</span>
                            <span className="semicolon">:</span>
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
                        <div>
                            <span className="span">班级</span>
                            <span className="semicolon">:</span>
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
                        <div>
                            <span className="span">阶段</span>
                            <span className="semicolon">:</span>
                            <Select
                                mode="multiple"
                                allowClear
                                style={{ width: 240 }}
                                value={selSemester}
                                onChange={this.handleSemester.bind(this)}
                            >
                                {semester.map((item: any) => (
                                    <Option key={item.semesterId} value={item.semesterId}>
                                        {item.semesterName || item.semesterId}
                                    </Option>
                                ))}
                            </Select>
                        </div>
                        
                    </div>
                    <div className="thr">
                        <Table
                            columns={columns1}
                            dataSource={data1}
                            pagination={false}
                            size={'middle'}
                            bordered={false}
                        />
                    </div>
                    <div className={data1.length ? 'pag' : 'display-none'}>
                        <Pagination
                            defaultCurrent={1}
                            pageSize={20}
                            current={pageNo}
                            total={allCount}
                            onChange={this.nowPagChange.bind(this)}
                        />
                    </div>
                </div>
                <Modal
                    width={'680px'}
                    title="发布作文任务"
                    visible={isVisible}
                    cancelText="取消"
                    okText="确定"
                    onOk={this.handleCreateOk.bind(this)}
                    onCancel={this.handleCreateCancel.bind(this)}
                >
                    <div className="exam-module-area">
                        <span className="span">任务名称:</span>
                        <Input
                            className="gap-8"
                            placeholder="请输入作文任务名称"
                            value={createExamName}
                            onChange={this.onCreateExamNameChange.bind(this)}
                            maxLength={200}
                        />
                    </div>
                    <div className="exam-module-area exam-module-area2">
                        <div className="left">
                            <span className="span span1">作文ID:</span>
                            <Input
                                className="gap-8"
                                style={{ width: 150 }}
                                placeholder="请输入作文ID"
                                value={createWritingId}
                                onChange={this.onCreateWritingIdChange.bind(this)}
                                maxLength={200}
                            />
                        </div>
                        <div className="right">
                            <span className="span span2">任务类型
                                <span className="span-tips">
                                    <Tooltip
                                        title={content1}
                                        trigger="hover"
                                        placement="top"
                                        color="rgba(0, 0, 0, 0.7)"
                                        overlayStyle={{ minWidth: '300px' }}
                                    >
                                        <InfoCircleOutlined />
                                    </Tooltip>
                                </span>
                                :
                            </span>
                            <Radio.Group
                                onChange={this.onCreateExamTypeChange.bind(this)}
                                value={createExamType}
                                defaultValue="practice"
                            >
                                <Radio value={'test'}>测试</Radio>
                                <Radio value={'practice'}>练习</Radio>
                            </Radio.Group>
                        </div>
                    </div>
                    <div className="exam-module-area exam-module-area2">
                        <div className="left">
                            <span className="span span2">开始时间:</span>
                            <Space direction="vertical" size={12}>
                                <DatePicker
                                    defaultValue={moment(createStartTime, dateFormat)}
                                    format={dateFormat}
                                    onChange={this.onCreateStartTimeChange.bind(this)}
                                />
                            </Space>
                        </div>
                        <div className="right">
                            <span className="span span2">截止时间:</span>
                            <Space direction="vertical" size={12}>
                                <DatePicker
                                    defaultValue={moment(createEndTime, dateFormat)}
                                    format={dateFormat}
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

export default writingExam;
