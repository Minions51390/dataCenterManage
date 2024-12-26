import React, {useState, useEffect } from 'react';
import { withRouter } from 'react-router-dom';
import { Table, Input, Select, Pagination, message, Tooltip, DatePicker, Button, Popconfirm, PageHeader} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import style from './index.module.less';
import { get, post, baseUrl } from '../../../service/tools';
import { dateFormat, dateFormatHms, FunGetDateStr } from '../../../utils/date';
import useDebounce from '../../../hooks/useDebounce';
import moment from 'moment';
import DrawerForm from '../WordQuizDrawer/index';
const { Option } = Select;
const { RangePicker } = DatePicker;

const WordQuiz = (props:any) => {
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
    const [startTime, setStartTime] = useState(moment((new Date(FunGetDateStr(-21, new Date()) + " 00:00:00") as any)).format(dateFormatHms));
    const [endTime, setEndTime] = useState(moment((new Date(FunGetDateStr(8, new Date()) + " 00:00:00") as any)).format(dateFormatHms));
    const [pageNo, setPageNo] = useState(1);
    const [totalCount, setTotalCount] = useState(1);
    const [sortKey, setSortKey] = useState('score');
    const [order, setOrder] = useState('desc');
    const [data, setData] = useState([]);
    
    const statusTextList = ['全部', '进行中', '已结束'];
    const routes = [
        {
            path: '/app/wordCenter/wordQuiz',
            breadcrumbName: '单词小测',
        },
    ];
    const columns = [
        {
            title: '序号',
            key: 'key',
            render: (text: any, record: any, index: number) => <div>{index + 1 + (pageNo - 1) * 20}</div>,
        },
        {
            title: '考试名称',
            dataIndex: 'wordTestName',
            key: 'wordTestName',
        },
        {
            title: '班级',
            dataIndex: 'className',
            key: 'className',
        },
        {
            title: '学习阶段',
            dataIndex: 'semesterName',
            key: 'semesterName',
        },
        {
            title: '考试起止时间',
            key: 'startTime',
            render: (text: any) => (
                <div className={style['time']}>
                    <div>{text.startTime}</div>
                    <div>～</div>
                    <div>{text.endTime}</div>
                </div>
            ),
        },
        {
            title: '试卷状态',
            key: 'status',
            render: (text: any) => <div>{statusTextList[text.status]}</div>,
        },
        {
            title: '操作',
            key: 'control',
            render: (text: any) => (
                <div className={style['edit']}>
                    <div>
                        {text.status === 1 ? (
                            <Popconfirm
                                placement="topLeft"
                                title="是否确认删除？删除后无法恢复!"
                                okText="确认"
                                cancelText="取消"
                                onConfirm={()=>handleDeleteConfirm(text.wordTestId)}
                            >
                                <div>删除</div>
                            </Popconfirm>
                        ) : (
                            <div className={style['gray']}>删除</div>
                        )}
                    </div>
                    <div onClick={()=>handleDetailClick(text.wordTestId)}>详情</div>
                </div>
            ),
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
        setSelTeacher(selTeacher);
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
        setStartTime(moment(new Date(val[0]._d) as any).format(dateFormatHms));
        setEndTime(moment(new Date(val[1]._d) as any).format(dateFormatHms));
    }
    /** 获取表格数据 */
    const getTableData = async () => {
        let { data } = await post({
            url: `${baseUrl}/api/v1/custom-word-test/get-list`,
            data: {
                query,
                    // queryType,
                    // sortKey,
                    // order,
                    teacherId: selTeacher.teacherId,
                    batchId: selPici,
                    classId: selBanji,
                    startTime,
                    endTime,
                    status,
                    pageNo,
                    pageSize: 20,
            },
        });
        setData(data?.data || []);
        setTotalCount(data?.totalCount || 1);
    }
    // 新增单词小测
    const createWordTest = async (val: any) => {
        let { data, state, msg } = await post({
            url: `${baseUrl}/api/v1/custom-word-test/create-word-test`,
            data: {
                testName: val.drawerExamName,
                startTime: val.drawerStartTime,
                endTime: val.drawerEndTime,
                classIds: val.selDrawerBanji,
                dictionaryId: val.dictionaryId,
                testTime: val.testTime,
                wordIds: val.checkedWordList
            }
        });
        if(state === 0){
            message.success('发布小测成功');
            setVisible(false);
            setLastChangeTimestamp(Date.now());
        }else{
            message.error(`发布小测失败:${msg}`);
            setVisible(false);
        }
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
    /** 关闭抽测弹窗 */
    const handleCloseDrawer = () => {
        setVisible(false);
    }
    /** 发布确认 */
    const handleFormSubmit = (val:any) => {
        createWordTest(val);
    }
    /** 删除小测 */
    const handleDeleteConfirm = async (wordTestId:number) => {
        let { data, state, msg } = await post({
            url: `${baseUrl}/api/v1/custom-word-test/delete-word-test`,
            data: {
                wordTestId
            }
        });
        if(state === 0){
            message.success('删除小测成功');
            setVisible(false);
            setLastChangeTimestamp(Date.now());
        }else{
            message.error(`删除小测失败:${msg}`);
            setVisible(false);
        }
    }
    /** 跳转卷面详情 */
    const handleDetailClick = (wordTestId:any) => {
        props.history.push(`/app/wordCenter/wordQuizDetail?wordTestId=${wordTestId}`);
    }

    return(
        <div className={style['word-quiz']}>
            <div className={style['header']}>
                <PageHeader title="" breadcrumb={{ routes }} />
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
                                moment(new Date(FunGetDateStr(-21, new Date())), dateFormatHms),
                                moment(new Date(FunGetDateStr(8, new Date())), dateFormatHms),
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

export default withRouter(WordQuiz);