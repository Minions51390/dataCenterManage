import React from 'react';
import { PageHeader, message, Button, Divider } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import '../../style/pageStyle/WritingDetail.less';
import { get, baseUrl } from '../../service/tools';
import { getQueryString } from '../../utils';
import copy from 'clipboard-copy';
class writingDetail extends React.Component {
    state = {
        routes: [
            {
                path: '/app/writing/writingPaper',
                breadcrumbName: '作文管理',
            },
            {
                path: '/writingDetail',
                breadcrumbName: `作文物料`,
            },
        ],
        writingId: 0,
        writingCode: '',
        name: '',
        title: '',
        desc: '',
        creator: '',
        createTime: '',
        level: '',
        maximum: '',
        minimun: '',
    };
    componentWillMount() {
        this.inited();
    }
    async inited() {
        const writingId = decodeURI(getQueryString().writingId || '');
        this.setState({
            writingId,
        }, ()=>{
            this.fetchWritingDetail()
        })
    }
    // 获取作文物料详情
    async fetchWritingDetail(){
        const { writingId } = this.state;
        const res = await get({ url: `${baseUrl}/api/v1/writing/?writingId=${writingId}` });
        if(res.state === 0){
            this.setState({
                writingId: res?.data?.writingId,
                writingCode: res?.data?.writingCode,
                name: res?.data?.name,
                title: res?.data?.title,
                desc: res?.data?.desc,
                creator: res?.data?.creator,
                createTime: res?.data?.createTime,
                level: res?.data?.level,
                maximum: res?.data?.maximum,
                minimun: res?.data?.minimun,
            });
        }else{
            message.error(`获取物料详情失败:${res.msg}`)
        }
    }

    copyIdFn(val:any){
        copy(val)
            .then(() => {
                message.success('复制成功');
            })
            .catch(() => {
                message.error('复制失败');
            });
    }

    render() {
        const {
            writingId, 
            writingCode,
            routes,
            name,
            title,
            desc,
            creator,
            createTime,
            level,
            maximum,
            minimun,
        } = this.state;
        return (
            <div className="writing-detail-wrapper">
                <div className="header">
                    <PageHeader title="" breadcrumb={{ routes }} />
                    <div className="sec">
                        <div className="text">{name}</div>
                        <Button onClick={this.copyIdFn.bind(this, writingCode)}>复制试卷ID</Button>
                    </div>
                    <div className="thr">
                        <div className="tr">
                            <div>
                                创建人：<span>{creator}</span>
                            </div>
                            <div>
                                创建时间：<span>{createTime}</span>
                            </div>
                            <div>
                                等级：<span>{level}</span>
                            </div>
                        </div>
                        <div className="tr">
                            <div>
                                作文ID：<span>{writingCode}</span>
                            </div>
                            <div>
                                词数限制：<span>{`${minimun}词-${maximum}词`}</span>
                            </div>
                            <div />
                        </div>
                    </div>
                </div>
                <div className="body">
                    <div className="fir" >
                        <div className="title">作文标题</div>
                        <div className="writing-title">{title}</div>
                    </div>
                    <Divider style={{ margin: '4px 0' }} />
                    <div className="sec" >
                        <div className="title">写作要求</div>
                        <div className="writing-desc">{desc}</div>
                    </div>
                </div>
            </div>
        );
    }
}

export default writingDetail;
