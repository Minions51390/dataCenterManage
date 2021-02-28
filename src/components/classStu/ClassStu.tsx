import React from 'react';
import { Select, Pagination } from 'antd';
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
            },
        ],
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

    render() {
        const { pici, banji, nowClass, finClass, piciF, banjiF } = this.state;
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
                        <Link className="item-add" to={'/app/class/main/class'}>
                            新增班级
                        </Link>
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
