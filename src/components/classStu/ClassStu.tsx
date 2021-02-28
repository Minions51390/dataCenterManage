import React from 'react';
import { Select, Pagination, Modal, Input, Divider } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import '../../style/pageStyle/ClassStu.less';
const { Option } = Select;

class ClassStu extends React.Component {
    state = {
        pici: ['一批次', '二批次'],
        banji: ['一班', '二班'],
        piciF: ['一批次', '二批次'],
        banjiF: ['一班', '二班'],
        nowClass: [
            {
                class: '五期01班',
                count: 23,
                classNum: 12345678,
                creatDate: '2020-12-12',
            },
            {
                class: '五期01班',
                count: 23,
                classNum: 12345678,
                creatDate: '2020-12-12',
            },
            {
                class: '五期01班',
                count: 23,
                classNum: 12345678,
                creatDate: '2020-12-12',
            },
            {
                class: '五期01班',
                count: 23,
                classNum: 12345678,
                creatDate: '2020-12-12',
            },
            {
                class: '五期01班',
                count: 23,
                classNum: 12345678,
                creatDate: '2020-12-12',
            },
            {
                class: '五期01班',
                count: 23,
                classNum: 12345678,
                creatDate: '2020-12-12',
            },
            {
                class: '五期01班',
                count: 23,
                classNum: 12345678,
                creatDate: '2020-12-12',
            },
        ],
        finClass: [
            {
                class: '五期01班',
                count: 23,
                classNum: 12345678,
                creatDate: '2020-12-12',
            },
            {
                class: '五期01班',
                count: 23,
                classNum: 12345678,
                creatDate: '2020-12-12',
            },
            {
                class: '五期01班',
                count: 23,
                classNum: 12345678,
                creatDate: '2020-12-12',
            },
            {
                class: '五期01班',
                count: 23,
                classNum: 12345678,
                creatDate: '2020-12-12',
            },
            {
                class: '五期01班',
                count: 23,
                classNum: 12345678,
                creatDate: '2020-12-12',
            },
            {
                class: '五期01班',
                count: 23,
                classNum: 12345678,
                creatDate: '2020-12-12',
            },
            {
                class: '五期01班',
                count: 23,
                classNum: 12345678,
                creatDate: '2020-12-12',
            },
            {
                class: '五期01班',
                count: 23,
                classNum: 12345678,
                creatDate: '2020-12-12',
            }
        ],
        newPici: ['01期', '02期', '03期'],
        newPiciVal: '01期',
        isVisible: false
    };
    handlePiCi(val: any) {
        console.log(val);
    }
    handleBanJi(val: any) {
        console.log(val);
    }
    handlePiCiF(val: any) {
        console.log(val);
    }
    handleBanJiF(val: any) {
        console.log(val);
    }
    handleOk(val: any) {
        console.log(val);
        this.setState({
            isVisible: false
        });
        window.location.href = '/#/app/class/main/class';
    }
    handleCancel(val: any) {
        console.log(val);
        this.setState({
            isVisible: false
        });
    }
    showModal() {
        this.setState({
            isVisible: true
        });
    }
    onNewPiciValChange(event: any) {
        this.setState({
            newPiciVal: event.target.value,
        });
    }
    addItem() {
        console.log('addItem');
        const { newPiciVal, newPici } = this.state;
        this.setState({
            newPici: [...newPici, newPiciVal]
        });
    }

    render() {
        const { pici, banji, nowClass, finClass, piciF, banjiF, isVisible, newPici, newPiciVal } = this.state;
        return (
            <div className="class-main-wrapper">
                <div className="bread-title">
                    <div className="fir-title">班级和学员管理</div>
                    <div className="sec-title">班级和学员管理</div>
                </div>
                <div className="select-area">
                    <div className="fir">当前职教班级</div>
                    <div className="thr">
                        <span className="span">筛选班级:</span>
                        <Select
                            defaultValue={banji[0]}
                            style={{ width: 180 }}
                            onChange={this.handleBanJi.bind(this)}
                        >
                            {banji.map((item) => (
                                <Option key={item} value={item}>
                                    {item}
                                </Option>
                            ))}
                        </Select>
                    </div>
                    <div className="sec">
                        <span className="span">学员批次:</span>
                        <Select
                            defaultValue={pici[0]}
                            style={{ width: 180 }}
                            onChange={this.handlePiCi.bind(this)}
                        >
                            {pici.map((item) => (
                                <Option key={item} value={item}>
                                    {item}
                                </Option>
                            ))}
                        </Select>
                    </div>
                </div>
                <div className="now-area">
                    <div className="item-area">
                        {nowClass.map((item, index) => (
                            <Link to={'/app/class/main/class'} key={index}>
                                <div className="item">
                                    <div className="title">{item.class}</div>
                                    <div className="sec-line">
                                        <div>班级人数</div>
                                        <div>班级码</div>
                                    </div>
                                    <div className="thr-line">
                                        <div>
                                            {item.count}
                                            <span>人</span>
                                        </div>
                                        <div>{item.classNum}</div>
                                    </div>
                                    <div className="aline">创建时间:{item.creatDate}</div>
                                </div>
                            </Link>
                        ))}
                        <div className="item-add" onClick={this.showModal.bind(this)}>
                            新增班级
                        </div>
                        <Modal title="新增班级" visible={isVisible} onOk={this.handleOk.bind(this)} onCancel={this.handleCancel.bind(this)}>
                            <div className="module-area">
                                学员批次: 
                                <Select
                                    className="gap"
                                    style={{ width: 240 }}
                                    placeholder="请选择学员批次"
                                    dropdownRender={menu => (
                                    <div>
                                        {menu}
                                        <Divider style={{ margin: '4px 0' }} />
                                        <div style={{ display: 'flex', flexWrap: 'nowrap', padding: 8 }}>
                                        <Input style={{ flex: 'auto' }} value={newPiciVal} onChange={this.onNewPiciValChange.bind(this)} />
                                        <div
                                            style={{ flex: 'none', padding: '8px', display: 'block', cursor: 'pointer' }}
                                            onClick={this.addItem.bind(this)}
                                        >
                                            <PlusOutlined /> 新增
                                        </div>
                                        </div>
                                    </div>
                                    )}
                                >
                                    {newPici.map((item, index) => (
                                    <Option key={index} value={item}>{item}</Option>
                                    ))}
                                </Select>
                            </div>
                            <div className="module-area">
                                班级名称:
                                <Input className="gap" style={{ width: 240 }} placeholder="请输入班级名称" />
                            </div>
                        </Modal>
                    </div>
                    <div className="pag">
                        <Pagination defaultCurrent={1} total={50} />
                    </div>
                </div>
                <div className="select-area">
                    <div className="fir">已结课班级</div>
                    <div className="thr">
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
                    </div>
                    <div className="sec">
                        <span className="span">学员批次:</span>
                        <Select
                            defaultValue={piciF[0]}
                            style={{ width: 180 }}
                            onChange={this.handlePiCiF.bind(this)}
                        >
                            {piciF.map((item) => (
                                <Option key={item} value={item}>
                                    {item}
                                </Option>
                            ))}
                        </Select>
                    </div>
                </div>
                <div className="finish-area">
                    <div className="item-area">
                        {finClass.map((item, index) => (
                            <div className="item" key={index}>
                                <div className="title">{item.class}</div>
                                <div className="sec-line">
                                    <div>班级人数</div>
                                    <div>班级码</div>
                                </div>
                                <div className="thr-line">
                                    <div>
                                        {item.count}
                                        <span>人</span>
                                    </div>
                                    <div>{item.classNum}</div>
                                </div>
                                <div className="aline">创建时间:{item.creatDate}</div>
                            </div>
                        ))}
                    </div>
                    <div className="pag">
                        <Pagination defaultCurrent={1} total={50} />
                    </div>
                </div>
            </div>
        );
    }
}

export default ClassStu;
