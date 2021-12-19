import React from 'react';
import { Table, Pagination, Input, Button, Modal, Select, PageHeader } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import '../../style/pageStyle/BankDetail.less';
// import { get, post, baseUrl } from '../../service/tools';
const { Option } = Select;
const ENUM_BANK_TYPE: any = {
    choice: '单选题',
    pack: '填空题',
};
class BankDetail extends React.Component {
    state = {
        routes: [
            {
                path: '/app/queBankCreate',
                breadcrumbName: '班级和学员管理',
            },
            {
                path: '/bankDetail',
                breadcrumbName: `${sessionStorage.getItem('bankDetailName') || '新建题库'}`,
            },
        ],
        bankQuery: '',
        isVisible: false,
        bankTypeList: ['choice', 'pack'],
        pageNo: 1,
        allCount: 1,
        /** 默认数据 */
        bankName: sessionStorage.getItem('bankDetailName') || '',
        creator: '',
        createTime: '0000-00-00 00:00:00',
        updateTime: '0000-00-00 00:00:00',
        bankType: 'choice',
        questionCount: '120',
    };
    componentWillMount() {
        this.inited();
    }
    async inited() {
        const bankData = await this.getBankData();
        this.setState({ ...bankData });
    }
    async getBankData() {
        return {
            creator: '老实',
            createTime: '0000-00-00 00:00:00',
            updateTime: '0000-00-00 00:00:00',
            bankType: 'choice',
            questionCount: '120',
        };
    }

    /** 搜索 */
    onBankQueryChange(event: any) {
        this.setState({
            bankQuery: event.target.value,
        });
    }

    /** 题库名称 */
    onBankNameChange(event: any) {
        this.setState({
            bankName: event.target.value,
        });
    }

    /** 确认新建 */
    handleCreateOk(val: any) {
        this.setState({
            isVisible: false,
        });
    }

    /** 取消新建 */
    handleCreateCancel(val: any) {
        this.setState({
            isVisible: false,
        });
    }

    /** 展示创建弹窗 */
    showCreateModal() {
        this.setState({
            isVisible: true,
        });
    }

    /** 更换页码 */
    nowPagChange(val: any) {
        this.setState(
            {
                pageNo: val,
            },
            async () => {
                /** 更新数据 */
            }
        );
    }

    render() {
        const {
            bankName,
            bankQuery,
            routes,
            creator,
            createTime,
            bankType,
            updateTime,
            questionCount,
        } = this.state;
        return (
            <div className="bank-detail-wrapper">
                <div className="header">
                    <PageHeader title="" breadcrumb={{ routes }} />
                    <div className="sec">
                        <div className="text">{bankName}</div>
                        <Button>删除题库</Button>
                    </div>
                    <div className="thr">
                        <div className="tr">
                            <div>
                                创建人：<span>{creator}</span>
                            </div>
                            <div>
                                创建时间：<span>{createTime}</span>
                            </div>
                            <div className="sp">共计题数</div>
                        </div>
                        <div className="tr">
                            <div>
                                题库类型：<span>{ENUM_BANK_TYPE[bankType]}</span>
                            </div>
                            <div>
                                更新时间：<span>{updateTime}</span>
                            </div>
                            <div className="hard">{questionCount}个</div>
                        </div>
                    </div>
                </div>
                <div className="body">
                    <div className="fir">
                        <div>
                            搜索题库:
                            <Input
                                className="gap-12"
                                style={{ width: 272 }}
                                placeholder="请输入关键词"
                                value={bankQuery}
                                onChange={this.onBankQueryChange.bind(this)}
                            />
                            <Button className="gap-48" type="primary">
                                查询
                            </Button>
                        </div>
                        <div onClick={this.showCreateModal.bind(this)}>
                            <Button type="primary" icon={<PlusOutlined />}>
                                新建
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default BankDetail;
