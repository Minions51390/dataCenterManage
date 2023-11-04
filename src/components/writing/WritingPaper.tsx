import React from 'react';
import { Input, Space, Button, Table, Select, Pagination, Modal, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import '../../style/pageStyle/WritingPaper.less';
import copy from 'clipboard-copy';
import { get, post, baseUrl } from '../../service/tools';
const { Option } = Select;
const { TextArea } = Input;
class writingPaper extends React.Component {
    state = {
        // 筛选
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
        ],
        creator: 0,
        creatorList: [],
        level: 'all',
        levelList: [],
        // 新增作文任务
        isVisible: false,
        createWritingName: '',
        createWritingTitle: '',
        createWritingDesc: '',
        createWritingLevel: '',
        createWritingMinimum: 120,
        createWritingMaximum: 160,
        // 表格
        columns1: [
            {
                title: '序号',
                dataIndex: 'key',
                render: (text: any, record: any, index: number) => <div>{index + 1 + (this.state.pageNo - 1) * 20}</div>,
            },
            {
                title: '作文名称',
                key: 'name',
                width: 360,
                textWrap: 'ellipsis',
                ellipsis: true,
                render: (text: any, record: any, index: number) => (
                    <div className="writing-name-box">
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
                title: '创建时间',
                dataIndex: 'createTime',
                key: 'createTime',
            },
            {
                title: '等级',
                dataIndex: 'level',
                key: 'level',
            },
            {
                title: '作文ID',
                key: 'writingCode',
                render: (text: any) => (
                    <div className="copy" onClick={this.handleWritingCodeClick.bind(this, text.writingCode)}>{text.writingCode}</div>
                )
            },
            {
                title: '操作',
                render: (text: any) => (
                    <div className="edit">
                        <div className="detail" onClick={this.handleDetailClick.bind(this, text.writingId)}>查看详情</div>
                    </div>
                ),
            },
        ],
        data1:[],
        pageNo: 1,
        pageSize: 20,
        allCount: 0,
    };
    componentWillMount() {
        this.inited();
    }
    async inited() {
        const curTeacherId = Number(localStorage.getItem("classTeacherId"));
        const creatorList = await this.fetchCreatorList();
        const levelList = await this.fetchLevelList();
        levelList.unshift({
            levelName: '全部',
            levelKey: 'all',
        })
        this.setState({
            creatorList,
            levelList,
            creator:curTeacherId
        }, async () => {
            this.getWritingList()
        });
    }
    // 获取创建人列表
    async fetchCreatorList(){
        let res = await get({ url: `${baseUrl}/api/v1/structure/teacher/list` });
        return res?.data || [];
    }

    // 获取等级列表
    async fetchLevelList(){
        let res = await get({ url: `${baseUrl}/api/v1/writing/level/list` });
        return res?.data || [];
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
        console.log('clickSearch', val)
        this.getWritingList()
    }
    // 筛选创建人更改
    handleCreatorChange(val:any){
        this.setState({
            creator: val,
        }, ()=>{
            this.getWritingList()
        })
    }
    // 筛选等级更改
    handleLevelChange(val:any){
        this.setState({
            level: val,
        }, ()=>{
            this.getWritingList()
        })
    }
    // 获取作文物料列表
    async getWritingList(){
        const {creator, level, pageNo, pageSize, query, queryType} = this.state;
        let res = await get({ url: `${baseUrl}/api/v1/writing/list?query=${query}&queryType=${queryType}&level=${level}&teacherId=${creator}&pageNo=${pageNo}&pageSize=${pageSize}` });
        this.setState({
            data1: res?.data?.data || [],
            allCount: res?.data?.totalCount,
        })
    }
    // 新建弹窗点击totalCount
    showCreateModal(val:any){
        this.setState({
            isVisible: true
        })
        console.log('showCreateModal', val)
    }
    // 作文物料名称修改
    onWritingNameChange(event:any){
        console.log('onWritingNameChange', event)
        this.setState({
            createWritingName: event.target.value,
        })
    }
    // 作文物料标题修改
    onWritingTitleChange(event:any){
        console.log('onWritingTitleChange', event)
        this.setState({
            createWritingTitle: event.target.value,
        })
    }
    // 作文物料描述修改
    onWritingDescChange(event:any){
        console.log('onWritingDescChange', event)
        this.setState({
            createWritingDesc: event.target.value,
        })
    }
    // 作文物料等级修改
    onWritingLevelChange(event:any){
        console.log('onWritingLevelChange', event)
        this.setState({
            createWritingLevel: event,
        })
    }
    // 作文物料最小字数修改
    onWritingMinChange(event:any){
        console.log('onWritingMinChange', event)
        this.setState({
            createWritingMinimum: event.target.value,
        })
    }
    // 作文物料最大字数修改
    onWritingMaxChange(event:any){
        console.log('onWritingMinChange', event)
        this.setState({
            createWritingMaximum: event.target.value,
        })
    }
    // 新建确定
    async handleCreateOk(val:any){
        const {
            createWritingName,
            createWritingTitle,
            createWritingDesc,
            createWritingLevel,
            createWritingMinimum,
            createWritingMaximum
        } = this.state;
        if(!createWritingName || !createWritingDesc || !createWritingLevel || !createWritingMinimum || !createWritingMaximum){
            message.error('请填写新建作文任务的必要信息');
            return
        }
        let res = await post({
            url: `${baseUrl}/api/v1/writing/`,
            data: {
                name: createWritingName,
                title: createWritingTitle,
                desc: createWritingDesc,
                level: createWritingLevel,
                minimum: createWritingMinimum,
                maximum: createWritingMaximum,
            },
        });
        if(res.state === 0){
            message.success('新建作文物料成功');
            this.setState({
                isVisible: false,
                createWritingName: '',
                createWritingTitle: '',
                createWritingDesc: '',
                createWritingLevel: '',
                createWritingMinimum: 120,
                createWritingMaximum: 160,
            })
            this.getWritingList()
        }else{
            message.error(`新建作文物料失败:${res.msg}`);
        }
    }
    // 新建取消
    handleCreateCancel(val:any){
        this.setState({
            isVisible: false
        })
        console.log('handleCreateCancel', val)
    }
    //作文ID点击
    handleWritingCodeClick(val:any){
        copy(val)
            .then(() => {
                message.success('复制成功');
            })
            .catch(() => {
                message.error('复制失败');
            });
    }
    //作文物料详情
    handleDetailClick(val:any){
        console.log('handleDetailClick', val)
        window.location.href = `${window.location.pathname}#/app/writing/writingDetail?writingId=${val}`
    }
    // 当前执教班级翻页
    pageNoChange(val: any) {
        this.setState({
            pageNo: val,
        }, async () => {
            this.getWritingList()
        });
    }
    render() {
        const {
            query,
            queryType,
            queryTypeList,
            isVisible,
            creator,
            creatorList,
            level,
            levelList,
            createWritingName,
            createWritingTitle,
            createWritingLevel,
            createWritingDesc,
            createWritingMinimum,
            createWritingMaximum,
            columns1,
            pageNo,
            allCount,
            data1,
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
                                    placeholder="请输入搜索内容"
                                    value={query}
                                    onChange={this.searchQueryChange.bind(this)}
                                />
                            </Input.Group>
                            <Button
                                className="gap-16"
                                type="primary"
                                onClick={this.clickSearch.bind(this)}
                            >
                                搜索
                            </Button>
                            <span className="span">创建人:</span>
                            <Select
                                defaultValue="请选择"
                                style={{ width: 180 }}
                                value={ creator || '请选择' }
                                onChange={this.handleCreatorChange.bind(this)}
                            >
                                {creatorList.map((item: any) => (
                                    <Option key={item.teacherId} value={item.teacherId}>
                                        {item.realName}
                                    </Option>
                                ))}
                            </Select>
                            <span className="span">等级:</span>
                            <Select
                                defaultValue="全部"
                                style={{ width: 180 }}
                                value={ level || '请选择'}
                                onChange={this.handleLevelChange.bind(this)}
                            >
                                {levelList.map((item: any) => (
                                    <Option key={item.levelKey} value={item.levelKey}>
                                        {item.levelName}
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
                            total={allCount}
                            onChange={this.pageNoChange.bind(this)}
                        />
                    </div>
                </div>
                <Modal
                    width={'644px'}
                    title="新建作文"
                    visible={isVisible}
                    cancelText="取消"
                    okText="确定"
                    onOk={this.handleCreateOk.bind(this)}
                    onCancel={this.handleCreateCancel.bind(this)}
                >
                    <div className="module-area">
                        <span className="span">
                            <span style={{ color: 'red', marginRight: '6px' }}>*</span>
                                作文任务名称:
                            </span>
                        <Input
                            className="gap-8"
                            style={{ width: 400 }}
                            placeholder="请输入作文任务名称"
                            value={createWritingName}
                            onChange={this.onWritingNameChange.bind(this)}
                            maxLength={200}
                        />
                    </div>
                    <div className="module-area">
                        <span className="span">作文标题:</span>
                        <Input
                            className="gap-8"
                            style={{ width: 400 }}
                            placeholder="请输入标题名称"
                            value={createWritingTitle}
                            onChange={this.onWritingTitleChange.bind(this)}
                            maxLength={200}
                        />
                    </div>
                    <div className="module-area module-area-start">
                        <span className="span">
                            <span style={{ color: 'red', marginRight: '6px' }}>*</span>
                            写作要求:
                        </span>
                        <TextArea
                            className="gap-8"
                            style={{ width: 400}}
                            placeholder="请输入写作要求"
                            value={createWritingDesc}
                            onChange={this.onWritingDescChange.bind(this)}
                            maxLength={2000}
                        />
                    </div>
                    <div className="module-area">
                        <span className="span">
                            <span style={{ color: 'red', marginRight: '6px' }}>*</span>
                            等级:
                        </span>
                        <Select
                            className="gap-8"
                            defaultValue="请选择"
                            value={ createWritingLevel || '请选择'}
                            style={{ width: 400 }}
                            onChange={this.onWritingLevelChange.bind(this)}
                        >
                            {levelList.map((item: any) => (
                                <Option key={item.levelKey} value={item.levelKey}>
                                    {item.levelName}
                                </Option>
                            ))}
                        </Select>
                    </div>
                    <div className="module-area">
                        <span className="span">
                            <span style={{ color: 'red', marginRight: '6px' }}>*</span>
                            词数限制:
                        </span>
                        <Space direction="vertical">
                            <Input 
                                className="gap-8"
                                style={{ width: 196 }}
                                addonBefore="不少于"
                                defaultValue="请输入"
                                value={createWritingMinimum}
                                onChange={this.onWritingMinChange.bind(this)}
                                maxLength={10}
                            />
                        </Space>
                        <Space direction="vertical">
                            <Input 
                                className="gap-8"
                                style={{ width: 196 }}
                                addonBefore="不高于"
                                defaultValue="请输入"
                                value={createWritingMaximum}
                                onChange={this.onWritingMaxChange.bind(this)}
                                maxLength={10}
                            />
                        </Space>
                    </div>
                </Modal>
            </div>
        );
    }
}

export default writingPaper;
