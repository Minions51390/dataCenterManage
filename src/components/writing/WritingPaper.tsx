import React from 'react';
import { Input, Button, Table, Select, Pagination, Modal } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import '../../style/pageStyle/WritingPaper.less';
import { get, post, baseUrl } from '../../service/tools';
const { Option } = Select;
class writingPaper extends React.Component {
    state = {
        query: '',
        queryType: 'writingName',
        queryTypeList: [
            {
                type: 'writingName',
                name: '作文名称',
            },
            {
                type: 'writingId',
                name: '作文ID',
            },
            {
                type: 'creator',
                name: '创建人',
            },
        ],
        writingName: '',
        isVisible: false,
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
        pageNo: 1,
        allCount: 1,
        wordDb: [],
        dbVal: '',
        columns1: [
            {
                title: '序号',
                dataIndex: 'key',
                render: (text: any, record: any, index: number) => <div>{index + 1 + (this.state.pageNo - 1) * 20}</div>,
            },
            {
                title: '作文名称',
                dataIndex: 'en',
                key: 'en',
            },
            {
                title: '创建人',
                dataIndex: 'creator',
                key: 'creator',
            },
            {
                title: '创建时间',
                dataIndex: 'createTime',
                key: 'createTime',
            },
            {
                title: '等级',
                dataIndex: 'wrongCount',
                key: 'wrongCount',
            },
            {
                title: '作文ID',
                dataIndex: 'wrongCount',
                key: 'wrongCount',
            },
            {
                title: '操作',
                dataIndex: 'wrongCount',
                key: 'wrongCount',
                render: (text: any) => (
                    <div className="edit">
                        <div className="detail" onClick={this.handleDetailClick.bind(this, text)}>查看详情</div>
                    </div>
                ),
            },
        ],
        data1: [],
        dictionary: '',
    };
    componentWillMount() {
        this.inited();
    }
    async inited() {
        // let userid = await this.login();
        let res = await this.getKu();
        if (!res[0]) {
            return;
        }
        const teacher = await this.getTeacher();
        const selTeacher = teacher.find((item:any) => {
            return item.teacherId === Number(localStorage.getItem("classTeacherId"))
        });
        this.setState(
            {
                wordDb: res,
                dbVal: res[0].dictionaryId,
                teacher,
                selTeacher,
            },
            async () => {
                const pici = await this.getPici(selTeacher.teacherId);
                const banji = await this.getClass(pici[0].batchId || 0);
                this.setState({
                    pici,
                    banji,
                    selPici: pici[0].batchId,
                    selBanji: banji[0].classId,
                }, async () => {
                    const semester = await this.getSemester(banji[0].classId || 0);
                    // const selSemester = semester.length > 0 ? [semester.find((item: any)=>item.isCurrent)?.semesterId ?? 0] : [];
                    const selSemester = [0]
                    this.setState({
                        semester,
                        selSemester,
                    });
                    await this.getRank(JSON.stringify(selSemester));
                })
            }
        );
    }
    handleDetailClick(val:any){
        console.log('handleDetailClick', val)
    }
    handleQueryType(val:any){
        console.log('handleQueryType', val)
    }
    onTestQueryChange(val:any){
        console.log('onTestQueryChange', val)
    }
    clickSearch(val:any){
        console.log('onTestQueryChange', val)
    }
    showCreateModal(val:any){
        this.setState({
            isVisible: true
        })
        console.log('onTestQueryChange', val)
    }
    handleCreateOk(val:any){
        console.log('handleCreateOk', val)
    }
    handleCreateCancel(val:any){
        console.log('handleCreateCancel', val)
    }
    onWritingNameChange(val:any){
        console.log('onWritingNameChange', val)
    }
    async getKu() {
        let res = await get({ url: baseUrl + '/api/v1/material/dictionary/list' });
        return res.data || [];
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
    async getRank(semesters: any) {
        const {selPici, selTeacher, selBanji} = this.state
        const { pageNo } = this.state;
        let res = await get({
            url:
                baseUrl +
                `/api/v1/wrong-book/?teacherId=${selTeacher.teacherId}&batchId=${selPici}&classId=${selBanji}&semesters=${semesters}&pageNo=${pageNo}&pageSize=20`,
            
        });
        console.log(res);
        let data1 = res.data.detail
            ? res.data.detail.map((val: any, index: number) => {
                  return {
                      key: index + 1,
                      en: val.en,
                      ch: val.ch,
                      phoneticSymbols: val.phoneticSymbols,
                      wrongCount: val.wrongCount,
                  };
              })
            : [];
        let dictionary = res.data.dictionary;
        this.setState({
            data1,
            allCount: res.data.totalPage,
            dictionary: dictionary,
        });
        return res.data || [];
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
        });
        await this.getRank(JSON.stringify(val));
    }
    async handleWordDb(value: any) {
        const { selSemester } = this.state;
        this.setState(
            {
                dbVal: value,
            },
            async () => {
                const ranklist = await this.getRank(JSON.stringify(selSemester));
            }
        );
    }
    nowPagChange(val: any) {
        const { selSemester } = this.state;
        this.setState(
            {
                pageNo: val,
            },
            async () => {
                const ranklist = await this.getRank(JSON.stringify(selSemester));
            }
        );
    }

    render() {
        const {
            query,
            queryType,
            queryTypeList,
            teacher,
            isVisible,
            writingName,
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
            wordDb,
            dbVal,
            dictionary,
            
        } = this.state;
        return (
            <div className="writing-wrapper">
                <div className="header">
                    <div className="fir">作文管理</div>
                    <div className="sec">作文列表</div>
                </div>
                <div className="body">
                    <div className="fir">
                        <div>
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
                                    placeholder="待输入"
                                    value={query}
                                    onChange={this.onTestQueryChange.bind(this)}
                                />
                            </Input.Group>
                            <Button
                                className="gap-30"
                                type="primary"
                                onClick={this.clickSearch.bind(this)}
                            >
                                搜索
                            </Button>
                            <span className="span">创建人:</span>
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
                            <span className="span">等级:</span>
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
                        <div onClick={this.showCreateModal.bind(this)}>
                            <Button className="gap-30" type="primary" icon={<PlusOutlined />}>
                                新建
                            </Button>
                        </div>
                    </div>
                    <div className="sec" />
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
                            total={allCount * 20}
                            onChange={this.nowPagChange.bind(this)}
                        />
                    </div>
                </div>
                <Modal
                    title="新建作文"
                    visible={isVisible}
                    cancelText="取消"
                    okText="确定"
                    onOk={this.handleCreateOk.bind(this)}
                    onCancel={this.handleCreateCancel.bind(this)}
                >
                    <div className="module-area">
                        <span className="span">作文任务名称:</span>
                        <Input
                            className="gap-8"
                            style={{ width: 294 }}
                            placeholder="请标题名称"
                            value={writingName}
                            onChange={this.onWritingNameChange.bind(this)}
                            maxLength={20}
                        />
                    </div>
                    <div className="module-area">
                        <span className="span">作文标题:</span>
                        <Input
                            className="gap-8"
                            style={{ width: 294 }}
                            placeholder="请标题名称"
                            value={writingName}
                            onChange={this.onWritingNameChange.bind(this)}
                            maxLength={20}
                        />
                    </div>
                    <div className="module-area">
                        <span className="span">写作要求:</span>
                        <Input
                            className="gap-8"
                            style={{ width: 294 }}
                            placeholder="请标题名称"
                            value={writingName}
                            onChange={this.onWritingNameChange.bind(this)}
                            maxLength={20}
                        />
                    </div>
                    <div className="module-area">
                        <span className="span">等级:</span>
                        <Input
                            className="gap-8"
                            style={{ width: 294 }}
                            placeholder="请标题名称"
                            value={writingName}
                            onChange={this.onWritingNameChange.bind(this)}
                            maxLength={20}
                        />
                    </div>
                </Modal>
            </div>
        );
    }
}

export default writingPaper;
