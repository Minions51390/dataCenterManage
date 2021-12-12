import React from 'react';
import { Table, Pagination } from 'antd';
import '../../style/pageStyle/TestPaper.less';
// import { get, post, baseUrl } from '../../service/tools';
class ErrorBook extends React.Component {
    state = {
        pageNo: 1,
        allCount: 1,
        columns1: [
            {
                title: '序号',
                dataIndex: 'key',
                key: 'key'
            },
            {
                title: '单词',
                dataIndex: 'en',
                key: 'en',
            },
            {
                title: '中文',
                dataIndex: 'ch',
                key: 'ch',
            },
            {
                title: '音标',
                dataIndex: 'phoneticSymbols',
                key: 'phoneticSymbols',
            },
            {
                title: '出错人次',
                dataIndex: 'wrongCount',
                key: 'wrongCount',
            }
        ],
        data1: [],
    };
    componentWillMount() {
        this.inited();
    }
    async inited() {
        
    }
    async getRank() {
        
    }
    
    /** 更换页面 */
    nowPagChange(val: any) {
        this.setState({
            pageNo: val
        }, async () => {
            /** 更新数据 */
        });
    }

    render() {
        const { columns1, data1, pageNo, allCount } = this.state;
        return (
            <div className="paper-wrapper">
                <div className="header">
                    <div className="fir">试卷管理</div>
                    <div className="sec">试卷列表</div>
                </div>
                <div className="body">
                    <div className="thr">
                        <Table
                            columns={columns1}
                            dataSource={data1}
                            pagination={false}
                            size={'middle'}
                            bordered={false}
                        />
                    </div>
                    <div className={data1.length ? "pag" : "display-none"}>
                        <Pagination defaultCurrent={1} pageSize={20} current={pageNo} total={allCount * 20} onChange={this.nowPagChange.bind(this)} />
                    </div>
                </div>
            </div>
        );
    }
}

export default ErrorBook;
