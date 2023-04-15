import React from 'react';
import { Select, Pagination, Modal, Input, Divider } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import '../../style/pageStyle/ClassStu.less';
import { get, post, baseUrl } from '../../service/tools';
const { Option } = Select;
class ClassStu extends React.Component {
    state = {
        pici: [],
        selPici: '',
        piciF: [],
        selPiciF: '',
        nowClass: [],
        nowPag: 1,
        finClass: [],
        finPag: 1,
        newPici: [],
        selNewPi: '',
        newPiciVal: '',
        newBanji: '',
        isVisible: false,
    };
    componentWillMount() {
        this.initData();
    }
    async initData() {
        // await this.login();
        const pici = await this.getPici();
        let selPici = parseInt(sessionStorage.getItem('piciId') as any) || pici[0].batchId;
        this.setState({
            selPici,
        });
        this.setState({
            pici,
            piciF: pici,
            newPici: pici,
        });
        let res = await this.getClass(selPici, 'sc');
        this.setState({
            selPici,
            nowClass: res,
        });
        let res1 = await this.getClass(pici[0].batchId, 'rt');
        this.setState({
            selPiciF: pici[0].batchId,
            finClass: res1,
        });
    }
    async login() {
        let res = await post({
            url: baseUrl + '/auth/login',
            data: {
                userName: 'yooky',
                password: '123',
            },
        });
        console.log(res);
    }
    async getPici() {
        let res = await get({ url: baseUrl + '/structure/batch/list' });
        console.log('lll', res);
        if (res != null) {
            return res.data.detail;
        } else {
            return [];
        }
    }
    async getClass(pici: any, cate: any) {
        let res = await get({
            url: baseUrl + `/structure/class/list?batchId=${pici}&category=${cate}`,
        });
        console.log(res);
        if (res != null) {
            return res.data.detail;
        } else {
            return [];
        }
    }
    async handlePiCi(val: any) {
        let res = await this.getClass(val, 'sc');
        this.setState({
            selPici: val,
            nowClass: res,
            nowPag: 1,
        });
        console.log(val);
    }
    // handleBanJi(val: any) {
    //     this.setState({
    //         selBanji: val
    //     });
    //     console.log(val);
    // }
    nowPagChange(val: any) {
        this.setState({
            nowPag: val,
        });
        console.log(val);
    }
    finPagChange(val: any) {
        this.setState({
            finPag: val,
        });
        console.log(val);
    }
    async handlePiCiF(val: any) {
        let res = await this.getClass(val, 'rt');
        this.setState({
            selPiciF: val,
            finClass: res,
        });
        console.log(val);
    }
    async handleOk(val: any) {
        console.log(val);
        const { selNewPi, newBanji, selPici } = this.state;
        this.setState({
            isVisible: false,
            newBanji,
        });

        let batchId = selNewPi || selPici;
        let res = await post({
            url: baseUrl + '/structure/class',
            data: {
                batchId: batchId,
                className: newBanji,
            },
        });
        this.setState({
            selPici: selNewPi,
            newBanji: '',
        });
        let list = await this.getClass(batchId, 'sc');
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
        console.log('lsf selNewPi', val);
        this.setState({
            selNewPi: val,
        });
    }
    async addItem() {
        console.log('addItem');
        const { newPiciVal } = this.state;
        let res = await post({
            url: baseUrl + '/structure/batch',
            data: {
                batchName: newPiciVal,
            },
        });
        let list = await this.getPici();
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

    render() {
        const {
            pici,
            selPici,
            nowClass,
            nowPag,
            finClass,
            finPag,
            piciF,
            selPiciF,
            isVisible,
            newPici,
            newPiciVal,
            newBanji,
            selNewPi,
        } = this.state;
        return (
            <div className="class-main-wrapper">
                <div className="bread-title">
                    <div className="fir-title">班级和学员管理</div>
                    <div className="sec-title">班级和学员管理</div>
                </div>
                <div className="select-area">
                    <div className="fir">当前执教班级</div>
                    {/* <div className="thr">
                        <span className="span">筛选班级:</span>
                        <Select
                            disabled={selPici ? false : true}
                            defaultValue="请选择"
                            style={{ width: 180 }}
                            onChange={this.handleBanJi.bind(this)}
                        >
                            {banji.map((item: any) => (
                                <Option key={item.classId} value={item.classId}>
                                    {item.describe}
                                </Option>
                            ))}
                        </Select>
                    </div> */}
                    <div className="sec">
                        <span className="span">学员批次:</span>
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
                </div>
                <div className="now-area">
                    <div className="item-area">
                        {nowClass.slice((nowPag - 1) * 7, nowPag * 7).map((item: any, index) => (
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
                    <div className={nowClass.length ? 'pag' : 'display-none'}>
                        <Pagination
                            defaultCurrent={1}
                            defaultPageSize={7}
                            current={nowPag}
                            total={nowClass.length}
                            onChange={this.nowPagChange.bind(this)}
                        />
                    </div>
                </div>
                <div className="select-area">
                    <div className="fir">已结课班级</div>
                    {/* <div className="thr">
                        <span className="span">筛选班级:</span>
                        <Select
                            defaultValue={banjiF[0]}
                            style={{ width: 180 }}
                            onChange={this.handleBanJiF.bind(this)}
                        >
                            {banjiF.map((item) => (
                                <Option key={item} value={item}>
                                    {item}
                                </Option>
                            ))}
                        </Select>
                    </div> */}
                    <div className="sec">
                        <span className="span">学员批次:</span>
                        <Select
                            defaultValue="请选择"
                            style={{ width: 180 }}
                            value={selPiciF || (piciF[0] && (piciF[0] as any).batchId) || '请选择'}
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
                    <div className={finClass.length ? 'pag' : 'display-none'}>
                        <Pagination
                            defaultCurrent={1}
                            defaultPageSize={7}
                            current={finPag}
                            total={finClass.length}
                            onChange={this.finPagChange.bind(this)}
                        />
                    </div>
                </div>
            </div>
        );
    }
}

export default ClassStu;
