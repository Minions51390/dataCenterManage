import React from 'react';
import { Select, Pagination, Modal, Input, Divider, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import '../../style/pageStyle/ClassStu.less';
import { get, post, baseUrl } from '../../service/tools';
const { Option } = Select;
class ClassStu extends React.Component {
    state = {
        //待接收班级
        piciW: [],
        selPiciW: '',
        waitClass: [],
        waitPag: 1,
        waitClassTotal: 0,
        //当前执教班级
        pici: [],
        selPici: '',
        nowClass: [],
        nowPag: 1,
        nowClassTotal: 0,
        // 以结课班级
        piciF: [],
        selPiciF: '',
        finClass: [],
        finPag: 1,
        finClassTotal: 0,
        // 他人执教班级
        piciO: [],
        selPiciO: '',
        othClass: [],
        othPag: 1,
        othClassTotal: 0,
        teacher: [],
        selTeacher: {
            teacherId: 0,
            realName: '',
        },
        // 新增班级
        newPici: [],
        selNewPi: '',
        newPiciVal: '',
        newBanji: '',
        isVisible: false,
        jiaojieModalVisible: false,
        jiaojieClass: {
            describe: '',
            classCode: '',
            classId: '',
        },
    };
    componentWillMount() {
        this.initData();
    }
    async initData() {
        const teacher = await this.getTeacher();
        const pici = await this.getPici();
        const selfPici = await this.getPici(Number(localStorage.getItem("classTeacherId")));
        let selPici = parseInt(sessionStorage.getItem('piciId') as any) || selfPici[0].batchId;
        this.setState({
            teacher,
            pici: selfPici,
            piciW: pici,
            piciF: selfPici,
            piciO: pici,
            newPici: pici,
            selPici,
            selPiciF: selfPici[0].batchId,
            selPiciO: pici[0].batchId,
            selPiciW: pici[0].batchId,
        });
        this.getWaitClass();
        this.getCurClass();
        this.getFinClass();
        this.getOthClass();
    }
    async getPici(teacherId = 0) {
        let res = await get({ url: `${baseUrl}/api/v1/structure/batch/list${teacherId ? `?teacherId=${teacherId}`: '' }` });
        console.log('lll', res);
        const pici = res.data || [];
        pici.unshift({
            describe: '全部',
            batchId: 0,
        });
        return pici;
    }
    async getClass(teacherId = 0, pici: any, cate: any, pageNo: any, pageSize = 8) {
        let res = await get({
            url: baseUrl + `/api/v1/structure/class/list?teacherId=${teacherId}&batchId=${pici}&category=${cate}&pageNo=${pageNo}&pageSize=${pageSize}`,
        });
        console.log(res);
        if (res != null) {
            res.data.classList.forEach((item:any) => {
                item.category = cate
            })
            return res.data;
        } else {
            return [];
        }
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
    // 获取待接收班级列表
    async getWaitClass(){
        const {selPiciW} = this.state;
        let res1 = await this.getClass(0, selPiciW, 'tc1', 1, 99999);
        let res2 = await this.getClass(0, selPiciW, 'tc2', 1, 99999);
        this.setState({
            waitClass: [...res1?.classList, ...res2?.classList],
            waitClassTotal: res1?.totalCount + res2?.totalCount,
        });
    }
    // 获取当前班级列表
    async getCurClass(){
        const {selPici, nowPag} = this.state;
        const teacherId = Number(localStorage.getItem("classTeacherId"));
        console.log('getCurClass', selPici)
        let res = await this.getClass(teacherId, selPici, 'sc', nowPag, 7);
        this.setState({
            nowClass: res?.classList,
            nowClassTotal: res?.totalCount,
        });
        console.log('res?.data?.totalCount', res)
    }
    // 获取已结课班级列表
    async getFinClass(){
        const {selPiciF, finPag} = this.state;
        const teacherId = Number(localStorage.getItem("classTeacherId"));
        let res = await this.getClass(teacherId, selPiciF, 'rt', finPag);
        this.setState({
            finClass: res?.classList,
            finClassTotal: res?.totalCount,
        });
    }
    // 获取他人班级列表
    async getOthClass(){
        const {selPiciO, othPag, selTeacher} = this.state;
        let res = await this.getClass(selTeacher.teacherId, selPiciO, 'oc', othPag);
        this.setState({
            othClass: res?.classList,
            othClassTotal: res?.totalCount,
        });
    }
    // 当前执教班级翻页
    nowPagChange(val: any) {
        this.setState({
            nowPag: val,
        }, async () => {
            this.getCurClass();
        });
    }
    // 已结课班级翻页
    finPagChange(val: any) {
        this.setState({
            finPag: val,
        }, async () => {
            this.getFinClass();
        });
    }
    // 待交接班级班级翻页
    waitPagChange(val: any) {
        this.setState({
            waitPag: val,
        }, async () => {
            this.getWaitClass();
        });
        console.log(val);
    }
    // 他人执教班级翻页
    othPagChange(val: any) {
        this.setState({
            othPag: val,
        }, async () => {
            this.getOthClass();
        });
        console.log(val);
    }
    // 当前执教班级 学员批次更改
    async handlePiCi(val: any) {
        this.setState({
            selPici: val,
            nowPag: 1,
        }, async () => {
            this.getCurClass();
        });
    }
    // 已结课班级 学员批次更改
    async handlePiCiF(val: any) {
        this.setState({
            selPiciF: val,
            finPag: 1,
        }, async () => {
            this.getFinClass();
        });
        console.log(val);
    }
    // 他人执教班级 学员批次更改
    async handlePiCiO(val: any) {
        this.setState({
            selPiciO: val,
            othPag: 1,
        }, async () => {
            const {piciO, selPiciO} = this.state;
            console.log(piciO, selPiciO)
            this.getOthClass();
        });
        console.log(val);
    }
    handleTeacher(val: any){
        const { teacher } = this.state;
        const selTeacher = teacher.find((item: any) => {
            return item.teacherId === val;
        });
        this.setState({
            selTeacher,
        }, async()=>{
            const pici = await this.getPici(val)
            this.setState({
                piciO: pici,
                selPiciO: pici[0].batchId,
            }, async () => {
                this.getOthClass();
            })
        });
    }
    async handleOk(val: any) {
        console.log(val);
        const { selNewPi, newBanji, selPici } = this.state;
        this.setState({
            isVisible: false,
            newBanji,
        });

        let batchId = selNewPi || selPici;
        if(!batchId){
            message.warn('请选择/新建批次');
            return
        }
        let res = await post({
            url: baseUrl + '/api/v1/structure/class',
            data: {
                batchId: batchId,
                className: newBanji,
            },
        });
        this.setState({
            selPici: selNewPi,
            newBanji: '',
        });
        const teacherId = Number(localStorage.getItem("classTeacherId"));
        const res1 = await this.getClass(teacherId, batchId, 'sc', 1, 7);
        let list = res1?.classList
        let nowPag = 1;
        if (list.length <= 7) {
            nowPag = 1;
        } else if (list.length > 7 && list.length % 7 > 0) {
            nowPag = Math.floor(list.length / 7) + 1;
        } else {
            nowPag = list.length / 7;
        }
        this.setState({
            nowClass: list,
            nowPag: nowPag,
        });
        console.log(res);
        // window.location.href = '/#/app/class/main/class';
    }
    handleCancel(val: any) {
        console.log(val);
        this.setState({
            isVisible: false,
            jiaojieModalVisible: false,
            newBanji: '',
        });
    }
    showModal() {
        this.setState({
            isVisible: true,
        });
    }
    onNewPiciValChange(event: any) {
        this.setState({
            newPiciVal: event.target.value,
        });
    }
    onClassChange(event: any) {
        this.setState({
            newBanji: event.target.value,
        });
    }
    handlePiciVal(val: any) {
        this.setState({
            selNewPi: val,
        });
    }
    async addItem() {
        console.log('addItem');
        const { newPiciVal } = this.state;
        if(!newPiciVal){
            message.warn('请输入批次');
            return
        }
        let res = await post({
            url: baseUrl + '/api/v1/structure/batch',
            data: {
                batchName: newPiciVal,
            },
        });
        let list = await this.getPici(Number(localStorage.getItem("classTeacherId")));
        this.setState({
            newPici: list,
            pici: list,
            selNewPi: list[list.length - 1].batchId,
        });

        console.log(res);
        // this.setState({
        //     newPici: [...newPici, {
        //         batchId: 'a',
        //         describe: newPiciVal
        //     }]
        // });
    }
    setClassName(val: any) {
        const { selPici } = this.state;
        sessionStorage.setItem('className', val.describe);
        sessionStorage.setItem('classId', val.classId);
        sessionStorage.setItem('piciId', selPici);
    }

    async HandleJiaojieOk(){
        const { selPici, jiaojieClass } = this.state;
        let res = await post({
            url: baseUrl + '/api/v1/structure/class/transfer/finish',
            data: {
                classId: jiaojieClass.classId,
                batchId : selPici,
            },
        });
        this.setState({
            jiaojieModalVisible: false
        })
        if(res.state === 0){
            message.success('接收成功')
            this.initData()
        }else{
            message.error(`${res.msg}`)
        }
    }
	jiaojieModal(item: any) {
        if(item.category === 'tc1'){
            message.warn('您不可以接收该班级');
        }else{
            this.setState({
                jiaojieClass: item,
                jiaojieModalVisible: true
            })
        }
	}

    render() {
        const {
            pici,
            selPici,
            nowClass,
            nowPag,
            waitClass,
            waitPag,
            finClass,
            finPag,
            piciF,
            selPiciF,
            piciO,
            selPiciO,
            othClass,
            othPag,
            isVisible,
            newPici,
            newPiciVal,
            newBanji,
            selNewPi,
            waitClassTotal,
            nowClassTotal,
            othClassTotal,
            finClassTotal,
            teacher,
            selTeacher,
            jiaojieClass,
            jiaojieModalVisible,
        } = this.state;
        return (
            <div className="class-main-wrapper">
                <div className="bread-title">
                    <div className="fir-title">班级和学员管理</div>
                    <div className="sec-title">班级和学员管理</div>
                </div>
                {/* 待交接班级 */}
                <div className="select-area">
                    <div className="fir">待交接班级</div>
                </div>
                <div className="finish-area">
                    {waitClass.length ? (
                        <div className="item-area">
                            {waitClass.map((item: any, index) => (
                                <div className="item" key={index} onClick={this.jiaojieModal.bind(this, item)}>
                                    <div className="title">{item.describe}</div>
                                    <div className="sec-line">
                                        <div>班级人数</div>
                                        <div>班级码</div>
                                    </div>
                                    <div className="thr-line">
                                        <div>
                                            {item.studentCount}
                                            <span>人</span>
                                        </div>
                                        <div>{item.classCode}</div>
                                    </div>
                                    <div className="aline">
                                        创建时间:{item.createDate.split('T')[0]}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="fins-area">暂无数据</div>
                    )}
                    <Modal
                        title="接收班级"
                        visible={jiaojieModalVisible}
                        onOk={this.HandleJiaojieOk.bind(this)}
                        onCancel={this.handleCancel.bind(this)}
                    >
                        <div className="jiaojie-text">是否接收{jiaojieClass.describe}（班级码{jiaojieClass.classCode})</div>
                        <div className="jiaojie-select">
                            <span>学员批次:</span>
                            <Select
                                defaultValue="请选择"
                                style={{ width: 180 }}
                                value={selPici || (pici[0] && (pici[0] as any).describe)}
                                onChange={this.handlePiCi.bind(this)}
                            >
                                {pici.map((item: any) => (
                                    <Option key={item.batchId} value={item.batchId}>
                                        {item.describe}
                                    </Option>
                                ))}
                            </Select>
                        </div>
                    </Modal>
                </div>
                {/* 当前职教班级 */}
                <div className="select-area">
                    <div className="fir">当前执教班级</div>
                    <div className="sec">
                        <span className="span">学员批次:</span>
                        <Select
                            defaultValue="请选择"
                            style={{ width: 180 }}
                            value={selPici || (pici[0] && (pici[0] as any).describe)}
                            onChange={this.handlePiCi.bind(this)}
                        >
                            {pici.map((item: any) => (
                                <Option key={item.batchId} value={item.batchId}>
                                    {item.describe}
                                </Option>
                            ))}
                        </Select>
                    </div>
                </div>
                <div className="now-area">
                    <div className="item-area">
                        {nowClass.map((item: any, index) => (
                            <Link
                                onMouseDown={this.setClassName.bind(this, item)}
                                to={`/app/class/main/class?classId=${item.classId}&piciId=${selPici}`}
                                key={index}
                            >
                                <div className="item">
                                    <div className="title">{item.describe}</div>
                                    <div className="sec-line">
                                        <div>班级人数</div>
                                        <div>班级码</div>
                                    </div>
                                    <div className="thr-line">
                                        <div>
                                            {item.studentCount}
                                            <span>人</span>
                                        </div>
                                        <div>{item.classCode}</div>
                                    </div>
                                    <div className="aline">
                                        创建时间:{item.createDate.split('T')[0]}
                                    </div>
                                </div>
                            </Link>
                        ))}
                        <div className="item-add" onClick={this.showModal.bind(this)}>
                            新增班级
                        </div>
                        <Modal
                            title="新增班级"
                            visible={isVisible}
                            onOk={this.handleOk.bind(this)}
                            onCancel={this.handleCancel.bind(this)}
                        >
                            <div className="module-area">
                                学员批次:
                                <Select
                                    defaultValue={selPici}
                                    className="gap"
                                    style={{ width: 240 }}
                                    placeholder="请选择学员批次"
                                    onChange={this.handlePiciVal.bind(this)}
                                    value={selNewPi || selPici}
                                    dropdownRender={(menu) => (
                                        <div>
                                            {menu}
                                            <Divider style={{ margin: '4px 0' }} />
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    flexWrap: 'nowrap',
                                                    padding: 8,
                                                }}
                                            >
                                                <Input
                                                    style={{ flex: 'auto' }}
                                                    value={newPiciVal}
                                                    onChange={this.onNewPiciValChange.bind(this)}
                                                />
                                                <div
                                                    style={{
                                                        flex: 'none',
                                                        padding: '8px',
                                                        display: 'block',
                                                        cursor: 'pointer',
                                                    }}
                                                    onClick={this.addItem.bind(this)}
                                                >
                                                    <PlusOutlined /> 新增
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                >
                                    {newPici.map((item: any, index) => (
                                        <Option key={index} value={item.batchId}>
                                            {item.describe}
                                        </Option>
                                    ))}
                                </Select>
                            </div>
                            <div className="module-area">
                                班级名称:
                                <Input
                                    className="gap"
                                    style={{ width: 240 }}
                                    placeholder="请输入班级名称"
                                    value={newBanji}
                                    onChange={this.onClassChange.bind(this)}
                                />
                            </div>
                        </Modal>
                    </div>
                    <div className={nowClassTotal ? 'pag' : 'display-none'}>
                        <Pagination
                            defaultCurrent={1}
                            defaultPageSize={7}
                            current={nowPag}
                            total={nowClassTotal}
                            onChange={this.nowPagChange.bind(this)}
                        />
                    </div>
                </div>
                {/* 已结课班级 */}
                <div className="select-area">
                    <div className="fir">已结课班级</div>
                    <div className="sec">
                        <span className="span">学员批次:</span>
                        <Select
                            defaultValue="请选择"
                            style={{ width: 180 }}
                            value={selPiciF || (piciF[0] && (piciF[0] as any).batchId)}
                            onChange={this.handlePiCiF.bind(this)}
                        >
                            {piciF.map((item: any) => (
                                <Option key={item.batchId} value={item.batchId}>
                                    {item.describe}
                                </Option>
                            ))}
                        </Select>
                    </div>
                </div>
                <div className="finish-area">
                    {finClass.length ? (
                        <div className="item-area">
                            {finClass.map((item: any, index) => (
                                <div className="item" key={index}>
                                    <div className="title">{item.describe}</div>
                                    <div className="sec-line">
                                        <div>班级人数</div>
                                        <div>班级码</div>
                                    </div>
                                    <div className="thr-line">
                                        <div>
                                            {item.studentCount}
                                            <span>人</span>
                                        </div>
                                        <div>{item.classCode}</div>
                                    </div>
                                    <div className="aline">
                                        创建时间:{item.createDate.split('T')[0]}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="fins-area">暂无数据</div>
                    )}
                    <div className={finClassTotal ? 'pag' : 'display-none'}>
                        <Pagination
                            defaultCurrent={1}
                            defaultPageSize={8}
                            current={finPag}
                            total={finClassTotal}
                            onChange={this.finPagChange.bind(this)}
                        />
                    </div>
                </div>
                {/* 他人执教班级 */}
                <div className="select-area">
                    <div className="fir">他人执教班级</div>
                    <div className="sec">
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
                        <span className="span span1">学员批次:</span>
                        <Select
                            defaultValue="请选择"
                            style={{ width: 180 }}
                            value={selPiciO || (piciO[0] && (piciO[0] as any).batchId)}
                            onChange={this.handlePiCiO.bind(this)}
                        >
                            {piciO.map((item: any) => (
                                <Option key={item.batchId} value={item.batchId}>
                                    {item.describe}
                                </Option>
                            ))}
                        </Select>
                    </div>
                </div>
                <div className="finish-area">
                    {othClass.length ? (
                        <div className="item-area">
                            {othClass.map((item: any, index) => (
                                <div className="item" key={index}>
                                    <div className="title">{item.describe}</div>
                                    <div className="sec-line">
                                        <div>班级人数</div>
                                        <div>班级码</div>
                                    </div>
                                    <div className="thr-line">
                                        <div>
                                            {item.studentCount}
                                            <span>人</span>
                                        </div>
                                        <div>{item.classCode}</div>
                                    </div>
                                    <div className="aline">
                                        创建时间:{item.createDate.split('T')[0]}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="fins-area">暂无数据</div>
                    )}
                    <div className={othClassTotal ? 'pag' : 'display-none'}>
                        <Pagination
                            defaultCurrent={1}
                            defaultPageSize={8}
                            current={othPag}
                            total={othClassTotal}
                            onChange={this.othPagChange.bind(this)}
                        />
                    </div>
                </div>
            </div>
        );
    }
}

export default ClassStu;
