import React, {useState, useEffect } from 'react';
import { Table, Input, Select, Pagination, message, Tooltip, DatePicker, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import style from './index.module.less';
import { get, post, baseUrl } from '../../../service/tools';
import { dateFormat, FunGetDateStr } from '../../../utils/date';
import useDebounce from '../../../hooks/useDebounce';
import moment from 'moment';
import DrawerForm from '../WordQuizDrawer/index';
const { Option } = Select;
const { RangePicker } = DatePicker;

const WordQuiz = () => {
    const [query, setQuery] = useState('');
    const [queryType] = useState('writingName');
    const debouncedQuery = useDebounce(query, 500);
    const [visible, setVisible] = useState(false);
    const [status, setStatus] = useState(0);
    const [statusList] = useState([
        {
            id: 0,
            name: '全部',
        },
        {
            id: 1,
            name: '进行中',
        },
        {
            id: 2,
            name: '已结束',
        },
    ]);
    const [teacher, setTeacher] = useState([]);
    const [selTeacher, setSelTeacher] = useState({realName:'', teacherId: 0});
    const [pici, setPici] = useState([]);
    const [selPici, setSelPici] = useState('');
    const [banji, setBanji] = useState([]);
    const [selBanji, setSelBanji] = useState('');
    const [lock, setLock] = useState(false);
    const [lastChangeTimestamp, setLastChangeTimestamp] = useState(0)
    const [startTime, setStartTime] = useState(moment().format(dateFormat));
    const [endTime, setEndTime] = useState(moment((new Date(FunGetDateStr(30, new Date()) + " 00:00:00") as any)).format(dateFormat));
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
        
    ];

    useEffect(() => {
        init();
    }, []);

    useEffect(() => {
        if(lastChangeTimestamp){
            getTableData();
        }
    }, [lastChangeTimestamp, debouncedQuery, status, startTime, endTime]);

    /** 初始化 */
    const init = async () => {
        const teacher = await getTeacher();
        const selTeacher = teacher.find((item:any) => {
            return item.teacherId === Number(localStorage.getItem("classTeacherId"))
        });
        setTeacher(teacher);
        const pici = await getPici(selTeacher.teacherId);
        const banji = await getClass(pici[0].batchId || 0);
        setTeacher(teacher);
        setPici(pici);
        setBanji(banji);
        setSelPici(pici[0].batchId);
        setSelBanji(banji[0].classId);
        setLastChangeTimestamp(Date.now());
    }

    /** 获取教师列表 */
    const getTeacher = async () => {
        let res = await get({ 
            url: `${baseUrl}/api/v1/structure/teacher/list`
        });
        const teacher = res?.data || [];
        teacher.unshift({
            realName: '全部',
            teacherId: 0,
        });
        return teacher;
    }
    /** 获取批次列表 */
    const getPici = async (teacherId:any) => {
        let res = await get({ 
            url: `${baseUrl}/api/v1/structure/batch/list`,
            config: {
                params: {
                    teacherId,
                }
            }
        });
        const pici = res.data || [];
        pici.unshift({
            describe: '全部',
            batchId: 0,
        });
        return pici;
    }
    /** 获取班级列表 */
    const getClass = async (pici: any) => {
        let res = await get({ 
            url: `${baseUrl}/api/v1/structure/class/list`,
            config: {
                params: {
                    teacherId: selTeacher.teacherId,
                    batchId: pici,
                    pageNo: 1,
                    pageSize: 99999,
                }
            }
        });
        const banji = res?.data?.classList ?? [];
        banji.unshift({
            classCode: '',
            classId: 0,
            createDate: '',
            describe: '全部',
            studentCount: 0,
        });
        return banji;
    }
    /** 考试状态更改 */
    const handleStatus = (val:any) => {
        setStatus(val);
    }
    /** 教师更改 */
    const handleTeacher = async (val:any) => {
        const selTeacher = teacher.find((item:any) => {
            return item.teacherId === val
        }) || { realName: '', teacherId: 0 }; 
        const res = await getPici(val);
        const pici = res[0] ? res[0]?.batchId : '';
        setSelTeacher(selTeacher);
        setPici(res);
        handlePiCi(pici);
    }
    /** 批次更改 */
    const handlePiCi = async (val:any) => {
        const res = await getClass(val);
        let selBanji = res[1] ? res[1].classId : 0;
        if(!val){
            selBanji = 0
        }
        setSelPici(val);
        setBanji(res);
        setSelBanji(selBanji);
        handleBanji(selBanji)
    }
    /** 班级更改 */
    const handleBanji = (val:any) => {
        setSelBanji(val);
        setLastChangeTimestamp(Date.now());
    }
    /** 时间更改 */
    const handleDateChange = (val:any) => {
        setStartTime(moment(new Date(val[0]._d) as any).format(dateFormat));
        setEndTime(moment(new Date(val[1]._d) as any).format(dateFormat));
    }
    /** 获取表格数据 */
    const getTableData = async () => {
        let { data } = await get({
            url: `${baseUrl}/api/v1/writing/self-list`,
            config: {
                params: {
                    query,
                    queryType,
                    sortKey,
                    order,
                    teacherId: selTeacher.teacherId,
                    batchId: selPici,
                    classId: selBanji,
                    startTime,
                    endTime,
                    status,
                    pageNo,
                    pageSize: 20,
                }
            }
        });
        setData(data?.data || []);
        setTotalCount(data?.totalCount || 1);
    }
    // 新增单词小测
    const createWordTest = async (val: any) => {
        let { data } = await post({
            url: `${baseUrl}/api/v1/diy-word-test/create-word-test`,
            data: {...val}
        });
        console.log('createWordTest', data);
    }
    /** 搜索框值更改 */ 
    const searchQueryChange = (e:any) => {
        const newQuery = e.target.value;
        setQuery(newQuery);
    }
    /** 表格排序 */
    const tableChange = (pagination: any, filter:any, sorter: any, extra: any) => {
        if (sorter?.columnKey) {
            const order = (sorter?.order || '').replace('end', '');
            setSortKey(sorter.columnKey)
            setOrder(order);
        }
    }
    /** 页数更改 */
    const nowPagChange = (val: any) => {
        setPageNo(val);
    }
    /** 显示抽测弹窗 */
    const showCreateDrawer = () => {
        setVisible(true);
    }
    const handleCloseDrawer = () => {
        setVisible(false);
    }
    const handleFormSubmit = (val:any) => {
        console.log('handleFormSubmit', val)
        createWordTest(val);
    }

    return(
        <div className={style['word-quiz']}>
            <div className={style['header']}>
                <div className={style['header-breadcrumb']}>单词抽测</div>
                <div className={style['header-title']}>
                    单词抽测
                    <div onClick={showCreateDrawer}>
                        <Button className="gap-30" type="primary" icon={<PlusOutlined />}>
                            发布任务
                        </Button>  
                    </div>
                </div>
            </div>
            {
                visible && (
                    <DrawerForm
                        visible={visible}
                        onClose={handleCloseDrawer}
                        onSubmit={handleFormSubmit}
                        title="发布测试"
                    />
                )
            }
            
            <div className={style['content']}>
                <div className={style['fir']}>
                    <Input
                        style={{ width: '240px' }}
                        placeholder="请输入测试名称"
                        value={query}
                        onChange={searchQueryChange}
                    />
                    <div className={style['select-box']}>
                        <span className={style['span']}>试卷状态:</span>
                        <Select
                            style={{ width: 140 }}
                            value={status || (statusList[0] && (statusList[0] as any).name) || '请选择'}
                            onChange={handleStatus}
                        >
                            {statusList.map((item: any) => (
                                <Option key={item.id} value={item.id}>
                                    {item.name}
                                </Option>
                            ))}
                        </Select>
                    </div>
                </div>
                <div className={style['sec']}>
                    <div className={style['select-box']}>
                        <span className={style['span']}>执教教师:</span>
                        <Select
                            defaultValue="请选择"
                            style={{ width: 180 }}
                            value={
                                selTeacher?.realName ||
                                (teacher[0] && (teacher[0] as any).realName) ||
                                '请选择'
                            }
                            onChange={handleTeacher}
                        >
                            {teacher.map((item: any) => (
                                <Option key={item.teacherId} value={item.teacherId}>
                                    {item.realName}
                                </Option>
                            ))}
                        </Select>
                    </div>
                    <div className={style['select-box']}>
                        <span className={style['span']}>学员批次:</span>
                        <Select
                            defaultValue="请选择"
                            style={{ width: 180 }}
                            value={selPici || (pici[0] && (pici[0] as any).describe) || '请选择'}
                            onChange={handlePiCi}
                        >
                            {pici.map((item: any) => (
                                <Option key={item.batchId} value={item.batchId}>
                                    {item.describe}
                                </Option>
                            ))}
                        </Select>
                    </div>
                    <div className={style['select-box']}>
                        <span className={style['span']}>班级:</span>
                        <Select
                            defaultValue="请选择"
                            style={{ width: 180 }}
                            value={selBanji || (banji[0] && (banji[0] as any).describe) || '请选择'}
                            onChange={handleBanji}
                        >
                            {banji.map((item: any) => (
                                <Option key={item.classId} value={item.classId}>
                                    {item.describe}
                                </Option>
                            ))}
                        </Select>
                    </div>
                    <div className={style['select-box']}>
                        <span className={style['span']}>时间:</span>
                        <RangePicker
                            defaultValue={[
                                moment(new Date(FunGetDateStr(-29, new Date())), dateFormat),
                                moment(new Date(), dateFormat),
                            ]}
                            onChange={handleDateChange}
                            format={dateFormat}
                        />
                    </div>
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

export default WordQuiz;