import React, {useState, useEffect, useMemo, useCallback} from 'react';
import { Table, Pagination, Input, Button, message, PageHeader, Select } from 'antd';
import '../../style/pageStyle/StuRank.less';
import copy from 'clipboard-copy';
import { get, baseUrl } from '../../service/tools';
import { useLocation } from 'react-router-dom';
import qs from 'qs';

const { Option } = Select;
const mockRollList = [
    {
        examPaperId: "xxxxx",
        username: "大橙子",
        score: 80,
        finishTime: "2017-10-31 23:12:00",
      	batchName: "一期",
        className: "01班"
    },
    {
        examPaperId: "xxxxx",
        username: "大橙子",
        score: 80,
        finishTime: "2017-10-31 23:12:00",
      	batchName: "一期",
        className: "01班"
    },
    {
        examPaperId: "xxxxx",
        username: "大橙子",
        score: 80,
        finishTime: "2017-10-31 23:12:00",
      	batchName: "一期",
        className: "01班"
    },
]
const StuRank = ()=>{
    const [query, setQuery] = useState('');
    const [pageNo, setPageNo] = useState(1);
    const [totalCount, setTotalCount] = useState(1);
    const [sortKey, setSortKey] = useState('score');
    const [sort, setSort] = useState('desc');
    const [examName, setExamName] = useState('');
    const [batchList, setBatchList] = useState<any[]>([]);
    const [allClasslist, setAllClasslist] = useState<any[]>([]);
    const [selectedBatch, setSelectedBatch] = useState<number>();
    const [selectedClass, setSelectedClass] = useState<number>();
    const [data, setData] = useState([]);
    
    const routes =  [
        {
            path: '/app/test/testRank',
            breadcrumbName: '已发布考试/考试成绩',
        },
        {
            path: '/stuRank',
            breadcrumbName: `${examName}成绩排行`,
        },
    ];

    const columns =  [
        {
            title: '序号',
            key: 'key',
            render: (text: any, record: any, index: number) => <div>{index + 1 + (pageNo - 1) * 20}</div>,
        },
        {
            title: '学员姓名',
            dataIndex: 'username',
            key: 'username',
        },
        {
            title: '考试成绩',
            dataIndex: 'score',
            key: 'score',
            sorter: true,
        },
        {
            title: '考试时间',
            dataIndex: 'finishTime',
            key: 'finishTime',
            sorter: true,
        },
        {
            title: '学员批次',
            dataIndex: 'batchName',
            key: 'batchName',
        },
        {
            title: '班级',
            dataIndex: 'className',
            key: 'className',
        },
        {
            title: '操作',
            key: 'control',
            render: (text: any, record: any) => (
                <div className="edit">
                    <div className="entry" onClick={() => goPaperDetail(record.username, record.examPaperId)}>
                        查看卷面
                    </div>
                </div>
            ),
        },
    ];
    const location = useLocation();
    const examId = qs.parse(location.search.slice(1)).examId;
    
    const init =  async () => {
        let { data } = await get({
            url: `${baseUrl}/api/v1/exam/batch-class`,
            config: {
                params: {
                    examId
                }
            }
        });
        const { batchClass, examName } = data;
        batchClass.unshift({
            describe: '全部',
            batchId: 0,
        });
        const allClasslist = batchClass.reduce((accumulator:any, currentValue:any)=>{
            return accumulator.concat(currentValue?.classes || []);
        }, [])
        setExamName(examName);
        setBatchList(batchClass);
        setAllClasslist(allClasslist);
        setSelectedBatch(batchClass?.[0]?.batchId);
        setSelectedClass(batchClass?.[0]?.classes?.[0]?.classId || 0);
    }

    const classList = useMemo(() => {
        console.log('classList')
        let list = []
        if(selectedBatch === 0){
            list = allClasslist
        }else{
            list = batchList?.find(item => item.batchId === selectedBatch)?.classes || [];
        }
        return [{
            describe: '全部',
            classId: 0,
        }, ...list]
    }, [batchList, selectedBatch]);

    const handleChangeBatch = (batchId: number) => {
        setSelectedBatch(batchId);
        setSelectedClass(batchList?.find(item => item.batchId === batchId)?.classes?.[0]?.classId || 0);
    }
    const goPaperDetail = (name: string, examPaperId: string) => {
        window.location.href = `${window.location.pathname}#/app/test/testPaper/stuDetail?examPaperId=${examPaperId}&examId=${examId}&batchId=${selectedBatch}&classId=${selectedClass}&query=${query}`;
    }
    /** 搜索 */
    const onTestQueryChange = (event: any) => {
        setQuery(event.target.value);
    }
    /** 排序更换触发 */
    const tableChange = (pagination: any, filters: any, sorter: any, extra: any) => {
        if (sorter?.columnKey) {
            const sort = (sorter?.order || '').replace('end', '');
            setSortKey(sorter?.columnKey)
            setSort(sort);
            getTest();
        }
        console.log(pagination, filters, sorter, extra);
    }

    /** 获取成绩列表 */
    const getTest = useCallback(async() => {
        let res = await get({
            url: `${baseUrl}/api/v1/exam/paper/list?pageSize=20&pageNo=${pageNo}&examId=${examId}&batchId=${selectedBatch}&classId=${selectedClass}&query=${query}&sortKey=${sortKey}&sort=${sort}`,
        });
        const rollList = res?.data?.examPaperList || mockRollList;
        const totalCount = (res?.data?.totalCount || 0) / 20;
        setData(rollList);
        setTotalCount(totalCount);
    }, [selectedClass, examId])

    useEffect(() => {
        getTest();
    }, [selectedClass, getTest]);

    /** 点击搜索按钮 */
    const clickSearch = () => {
        setPageNo(1);
        getTest();
    }

    /** 更换页面 */
    const nowPagChange = (val: any) => {
        setPageNo(val);
        getTest();
    }

    const jumpMistakeRank = () => {
        window.location.href = `${window.location.pathname}#/app/test/testRank/mistakeRank?examId=${examId}`;
    }

    useEffect(() => {
        init();
    }, []);

    return (
        <div className="stu-rank">
            <div className="header">
                <PageHeader title="" breadcrumb={{ routes }} />
                <div className="sec">{examName}</div>
            </div>
            <div className="body">
                <div className="fir">
                    <div>
                        <span className="span">学员批次:</span>
                        <Select
                            style={{ width: 180 }}
                            value={selectedBatch}
                            onChange={handleChangeBatch}
                        >
                            {batchList.map((item: any) => (
                                <Option key={item.batchId} value={item.batchId}>
                                    {item.describe}
                                </Option>
                            ))}
                        </Select>
                        <span className="span2">班级:</span>
                        <Select
                            style={{ width: 180 }}
                            value={selectedClass}
                            onChange={v => setSelectedClass(v)}
                        >
                            {classList.map((item: any) => (
                                <Option key={item.classId} value={item.classId}>
                                    {item.describe}
                                </Option>
                            ))}
                        </Select>
                        <Input
                            style={{ width: '240px', marginLeft: '30px' }}
                            placeholder="请输入学生姓名"
                            value={query}
                            onChange={onTestQueryChange}
                        />
                        <Button
                            className="gap-30"
                            type="primary"
                            onClick={clickSearch}
                        >
                            搜索
                        </Button>
                    </div>
                    <div className="mistakeRank" onClick={jumpMistakeRank}>查看错题排行</div>
                </div>
                <div className="thr">
                    <Table
                        columns={columns}
                        dataSource={data}
                        pagination={false}
                        size={'middle'}
                        bordered={false}
                        onChange={tableChange}
                    />
                </div>
                <div className={data.length ? 'pag' : 'display-none'}>
                    <Pagination
                        defaultCurrent={1}
                        pageSize={20}
                        current={pageNo}
                        total={totalCount * 20}
                        onChange={nowPagChange}
                    />
                </div>
            </div>
        </div>
    );
}

export default StuRank;
