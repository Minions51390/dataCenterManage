import React, {useState, useEffect} from 'react';
import { Table, Input, Select, Pagination, message, Tooltip } from 'antd';
import style from './index.module.less';
import { get, baseUrl } from '../../../service/tools';
import copy from 'clipboard-copy';
import { set } from 'nprogress';
const { Option } = Select;

const WritingCorpus = () => {
    const [query, setQuery] = useState('');
    const [queryType, setQueryType] = useState('writingName')
    const [level, setLevel] = useState('all');
    const [genuine, setGenuine] = useState(0);
    const [pageNo, setPageNo] = useState(1);
    const [totalCount, setTotalCount] = useState(1);
    const [sortKey, setSortKey] = useState('score');
    const [order, setOrder] = useState('desc');
    const [data, setData] = useState([]);
    
    const columns = [
        {
            title: '序号',
            key: 'key',
            render: (text: any, record: any, index: number) => <div>{index + 1 + (pageNo - 1) * 20}</div>,
        },
        {
            title: '作文',
            dataIndex: 'name',
            key: 'name',
            render: (text: any, record: any, index: number) => (
                <div className={style["writing-corpus-box"]}>
                    {/* {record.name? <div className={style["box-name"]} title={record.name}>{record.name}</div> :null} */}
                    {record.title? <div className={style["box-title"]}>{record.title}</div>:null}
                    <Tooltip
                        title={record.desc} 
                        overlayStyle={{
                            fontSize: '14px',
                            minWidth: '600px',
                        }}
                    >
                        {record.desc? <div className={style["box-desc"]}>{record.desc}</div>:null}
                    </Tooltip>
                    
                </div>
            ),
        },
        {
            title: '等级',
            dataIndex: 'level',
            key: 'level',
            filters: [
                {
                  text: 'cet4',
                  value: 'cet4',
                },
                {
                  text: 'cet6',
                  value: 'cet6',
                },
            ],
        },
        {
            title: '年份',
            key: 'year',
            sorter: true,
            render: (text: any) => (
                <div>{parseInt(text.origin)|| ''}</div>
            )
        },
        {
            title: '练习次数',
            dataIndex: 'referCount',
            key: 'referCount',
            sorter: true,
        },
        {
            title: '作文ID',
            key: 'writingCode',
            render: (text: any) => (
                <div className={style['copy']} onClick={()=>handleWritingCodeClick(text.writingCode)}>{text.writingCode}</div>
            )
        },
    ];

    const queryTypeList = [
        {
            type: 'writingName',
            name: '任务名称',
        },
        {
            type: 'writingCode',
            name: '作文ID',
        },
    ];
    // 获取倾橙作文库列表
    const getTableData = async () => {
        let { data } = await get({
            url: `${baseUrl}/api/v1/writing/self-list`,
            config: {
                params: {
                    query,
                    queryType,
                    level,
                    genuine,
                    sortKey,
                    order,
                    pageNo,
                    pageSize: 20,
                }
            }
        });
        setData(data?.data || []);
        setTotalCount(data?.totalCount || 1);
    }

    // 搜索类型切换
    const handleQueryType = (val:any) => {
        setQueryType(val);
    }
    // 搜索词更改
    const searchQueryChange = (val:any) => {
        setPageNo(1);
        setQuery(val.target.value);
    }
    //作文ID点击
    const handleWritingCodeClick = (val:any) =>{
        copy(val)
            .then(() => {
                message.success('复制成功');
            })
            .catch(() => {
                message.error('复制失败');
            });
    }
    // 表格排序改变
    const tableChange = (pagination: any, filter:any, sorter: any, extra: any) => {
        if(filter.level && filter.level.length === 1){
            setLevel(filter.level[0]);
        }else{
            setLevel('all');
        }
        if (sorter?.columnKey) {
            const order = (sorter?.order || '').replace('end', '');
            setSortKey(sorter.columnKey)
            setOrder(order);
        }
    }

    // 更换页面
    const nowPagChange = (val: any) => {
        setPageNo(val);
    }

    useEffect(() => {
        getTableData();
    }, [query, queryType, level, genuine, pageNo, sortKey, order]);
    return(
        <div className={style['writing-corpus']}>
            <div className={style['header']}>
                <div className={style['header-breadcrumb']}>倾橙作文库</div>
                <div className={style['header-title']}>倾橙作文库</div>
            </div>
            <div className={style['content']}>
                <div className={style['content-search']}>
                    <Input.Group compact>
                        <Select
                            defaultValue={queryType}
                            value={queryType || '请选择'}
                            onChange={handleQueryType}
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
                            onChange={searchQueryChange}
                        />
                    </Input.Group>
                </div>
                <div className={style['content-table']}>
                    <Table
                        columns={columns}
                        dataSource={data}
                        pagination={false}
                        size={'middle'}
                        bordered={false}
                        onChange={tableChange}
                    />
                </div>
                <div className={style['content-page']}>
                    <Pagination
                        defaultCurrent={1}
                        pageSize={20}
                        current={pageNo}
                        total={totalCount}
                        onChange={nowPagChange}
                    />
                </div>
            </div>
        </div>
    )
};

export default WritingCorpus;