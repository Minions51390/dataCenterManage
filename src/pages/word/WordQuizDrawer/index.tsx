import React, { useState, useEffect } from 'react';
import { Drawer, Button, Input, DatePicker, Divider, Alert, Select, Table, Pagination, message, Tooltip } from 'antd';
import { get, baseUrl } from '../../../service/tools';
import { dataFormatHms, FunGetDateStr } from '../../../utils/date';
import WordSelection from '../WordSelection/index';
import style from './index.module.less';

import moment from 'moment';

const { RangePicker } = DatePicker;
const { Option } = Select;

interface DrawerProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (values: 
        { 
            drawerExamName: string;
            drawerStartTime: string; 
            drawerEndTime: string; 
            selDrawerBanji: any[], 
            checkedWordList: number[], 
            selDrawerSemester: string,
            testNum: number,
            testTime: number,
        }) => void;
    title: string;
}


const DrawerForm: React.FC<DrawerProps> = ({ visible, onClose, onSubmit, title }) => {
    /*  Step 1 数据 **/
    const [drawerExamName, setDrawerExamName] = useState('');
    const [drawerStartTime, setDrawerStartTime] = useState(moment().format(dataFormatHms));
    const [drawerEndTime, setDrawerEndTime] = useState(moment((new Date(FunGetDateStr(7, new Date()) + " 00:00:00") as any)).format(dataFormatHms));
    const [selDrawerTeacher] = useState({realName:'', teacherId: localStorage.getItem("classTeacherId")});
    const [drawerPici, setDrawerPici] = useState([]);
    const [selDrawerPici, setSelDrawerPici] = useState(0);
    const [drawerBanji, setDrawerBanji] = useState([]);
    const [selDrawerBanji, setSelDrawerBanji] = useState<any[]>([]);
    const [drawerPageNo, setDrawerPageNo] = useState(1);
    const [drawerPageSize] = useState(20);
    const [drawerAllCount, setDrawerAllCount] = useState(0);
    /*  Step 2 数据 **/
    const [step, setStep] = useState(1);
    const [drawerSemester, setDrawerSemester] = useState([]);
    const [selDrawerSemester, setSelDrawerSemester] = useState('');
    const [testNum, setTestNum] = useState(40);
    const [testTime, setTestTime] = useState(20);
    const [orderSignal, setOrderSignal] = useState(0);
    const [wordList, setWordList] = useState([
        { word: 'hell1ohell1ohell1ohell1ohell1ohell1o', wordId: 1, meaning: 'n.你好' },
        { word: 'hello2hello2hello2hello2', wordId: 2, meaning: 'n.你好' },
        { word: 'hello3hello3hello3', wordId: 3, meaning: 'n.你好' },
        { word: 'hello4hello4', wordId: 4, meaning: 'n.你好' },
        { word: 'hello5', wordId: 5, meaning: 'n.你好' },
        { word: 'hello6', wordId: 6, meaning: 'n.你好' },
        { word: 'hello7', wordId: 7, meaning: 'n.你好' },
        { word: 'hello8', wordId: 8, meaning: 'n.你好' },
        { word: 'hello9', wordId: 9, meaning: 'n.你好' },
        { word: 'hello0', wordId: 10, meaning: 'n.你好' },
        { word: 'hello-', wordId: 11, meaning: 'n.你好' },
        { word: 'hello12', wordId: 12, meaning: 'n.你好' },
        { word: 'hello13', wordId: 13, meaning: 'n.你好' },
        { word: 'hello', wordId: 14, meaning: 'n.你好' },
        { word: 'hello', wordId: 15, meaning: 'n.你好' },
        { word: 'hello', wordId: 16, meaning: 'n.你好' },
        { word: 'hello', wordId: 17, meaning: 'n.你好' },
        { word: 'hello', wordId: 18, meaning: 'n.你好' },
        { word: 'hello', wordId: 19, meaning: 'n.你好' },
        { word: 'hello', wordId: 20, meaning: 'n.你好' },
        { word: 'hello', wordId: 21, meaning: 'n.你好' },
        { word: 'hello', wordId: 22, meaning: 'n.你好' },
        { word: 'hello', wordId: 23, meaning: 'n.你好' },
        { word: 'hello', wordId: 24, meaning: 'n.你好' },
        { word: 'hello', wordId: 25, meaning: 'n.你好' },
        { word: 'hello', wordId: 26, meaning: 'n.你好' },
        { word: 'hello', wordId: 27, meaning: 'n.你好' },
        { word: 'hello', wordId: 28, meaning: 'n.你好' },
        { word: 'hello', wordId: 29, meaning: 'n.你好' },
        { word: 'hello', wordId: 30, meaning: 'n.你好' },
        { word: 'hello', wordId: 31, meaning: 'n.你好' },
        { word: 'hello', wordId: 32, meaning: 'n.你好' },
        { word: 'hello', wordId: 33, meaning: 'n.你好' },
        { word: 'hello', wordId: 34, meaning: 'n.你好' },
        { word: 'hello', wordId: 35, meaning: 'n.你好' },
        { word: 'hello', wordId: 36, meaning: 'n.你好' },
        { word: 'hello', wordId: 37, meaning: 'n.你好' },
        { word: 'hello', wordId: 38, meaning: 'n.你好' },
        { word: 'hello', wordId: 39, meaning: 'n.你好' },
        { word: 'hello', wordId: 40, meaning: 'n.你好' },
        { word: 'hello', wordId: 41, meaning: 'n.你好' },
        { word: 'hello', wordId: 42, meaning: 'n.你好' },
        { word: 'hello', wordId: 43, meaning: 'n.你好' },
        { word: 'hello', wordId: 44, meaning: 'n.你好' },
        { word: 'hello', wordId: 45, meaning: 'n.你好' },
        { word: 'hello', wordId: 46, meaning: 'n.你好' },
        { word: 'hello', wordId: 47, meaning: 'n.你好' },
        { word: 'hello', wordId: 48, meaning: 'n.你好' },
        { word: 'hello', wordId: 49, meaning: 'n.你好' },
        { word: 'hello', wordId: 50, meaning: 'n.你好' },
        { word: 'hello', wordId: 51, meaning: 'n.你好' },
        { word: 'hello', wordId: 52, meaning: 'n.你好' },
        { word: 'hello', wordId: 53, meaning: 'n.你好' },
        { word: 'hello', wordId: 54, meaning: 'n.你好' },
        { word: 'hello', wordId: 55, meaning: 'n.你好' },
        { word: 'hello', wordId: 56, meaning: 'n.你好' },
        { word: 'hello', wordId: 57, meaning: 'n.你好' },
        { word: 'hello', wordId: 58, meaning: 'n.你好' },
        { word: 'hello', wordId: 59, meaning: 'n.你好' },
        { word: 'hello', wordId: 60, meaning: 'n.你好' },
        { word: 'hello', wordId: 61, meaning: 'n.你好' },
        { word: 'hello', wordId: 62, meaning: 'n.你好' },
        { word: 'hello', wordId: 63, meaning: 'n.你好' },
        { word: 'hello', wordId: 64, meaning: 'n.你好' },
        { word: 'hello', wordId: 65, meaning: 'n.你好' },
        { word: 'hello', wordId: 66, meaning: 'n.你好' },
        { word: 'hello', wordId: 67, meaning: 'n.你好' },
        { word: 'hello', wordId: 68, meaning: 'n.你好' },
        { word: 'hello', wordId: 69, meaning: 'n.你好' },
        { word: 'hello', wordId: 70, meaning: 'n.你好' },
        { word: 'hello', wordId: 71, meaning: 'n.你好' },
        { word: 'hello', wordId: 72, meaning: 'n.你好' },
        { word: 'hello', wordId: 73, meaning: 'n.你好' },
        { word: 'hello', wordId: 74, meaning: 'n.你好' },
        { word: 'hello', wordId: 75, meaning: 'n.你好' },
        { word: 'hello', wordId: 76, meaning: 'n.你好' },
        { word: 'hello', wordId: 77, meaning: 'n.你好' },
        { word: 'hello', wordId: 78, meaning: 'n.你好' },
        { word: 'hello', wordId: 79, meaning: 'n.你好' },
        { word: 'hello', wordId: 80, meaning: 'n.你好' },
        { word: 'hello', wordId: 81, meaning: 'n.你好' },
        { word: 'hello', wordId: 82, meaning: 'n.你好' },
        { word: 'hello', wordId: 83, meaning: 'n.你好' },
        { word: 'hello', wordId: 84, meaning: 'n.你好' },
        { word: 'hello', wordId: 85, meaning: 'n.你好' },
        { word: 'hello', wordId: 86, meaning: 'n.你好' },
        { word: 'hello', wordId: 87, meaning: 'n.你好' },
        { word: 'hello', wordId: 88, meaning: 'n.你好' },
        { word: 'hello', wordId: 89, meaning: 'n.你好' },
        { word: 'hello', wordId: 90, meaning: 'n.你好' },
        { word: 'hello', wordId: 91, meaning: 'n.你好' },
        { word: 'hello', wordId: 92, meaning: 'n.你好' },
        { word: 'hello', wordId: 93, meaning: 'n.你好' },
        { word: 'hello', wordId: 94, meaning: 'n.你好' },
        { word: 'hello', wordId: 95, meaning: 'n.你好' },
        { word: 'hello', wordId: 96, meaning: 'n.你好' },
        { word: 'hello', wordId: 97, meaning: 'n.你好' },
        { word: 'hello', wordId: 98, meaning: 'n.你好' },
        { word: 'hello', wordId: 99, meaning: 'n.你好' },
        { word: 'hello', wordId: 100, meaning: 'n.你好' }
    ]);
    const [checkedWordList, setCheckedWordList] = useState([]);
    const [drawerSearchWord, setDrawerSearchWord] = useState('');
    /*  常量 **/
    const drawerColumns = [{
        title: '序号',
        dataIndex: 'key',
        render: (text: any, record: any, index: number) => <div>{index + 1 + (drawerPageNo - 1) * drawerPageSize}</div>,
    },{
        title: '班级名称',
        key: 'describe',
        dataIndex: 'describe',
    },{
        title: '批次',
        key: 'batchName',
        dataIndex: 'batchName',
    }];
    const testNumList = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120];
    const testTimeList = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50 ,55, 60];

    useEffect(() => {
        init();
    }, []);

    useEffect(() => {
        getClass()
    }, [selDrawerPici, drawerPageNo]);

    useEffect(() => {
        if(step > 1){
            getSemester()
        }
    }, [step]);

    useEffect(() => {
        // getWordList();
    }, [selDrawerSemester]);

    /** 初始化 */
    const init = async () => {
        const pici = await getPici(selDrawerTeacher.teacherId);
        setDrawerPici(pici);
        setSelDrawerPici(pici[0].batchId);
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
    const getClass = async () => {
        let res = await get({ 
            url: `${baseUrl}/api/v1/structure/class/list`,
            config: {
                params: {
                    teacherId: selDrawerTeacher.teacherId,
                    batchId: selDrawerPici,
                    pageNo: drawerPageNo,
                    pageSize: drawerPageSize,
                }
            }
        });
        const banji = res?.data?.classList ?? [];
        setDrawerBanji(banji);
        setDrawerAllCount(res?.data?.totalCount);
    }
    /** 获取词库任务列表 */
    const getSemester = async () => {
        let res = await get({
            url: baseUrl + `/api/v1/structure/semester/list`,
            config: {
                params: {
                    teacherId: selDrawerTeacher.teacherId,
                    batchId: selDrawerPici,
                    classId: 0,
                }
            }
        })
        setDrawerSemester(res?.data || []);
        setSelDrawerSemester(res?.data[0]?.semesterId)
    }
    /** 获取词库单词列表 */
    const getWordList = async () => {
        let res = await get({
            url: baseUrl + `/api/v1/material/word/list`,
            config: {
                params: {
                    dictionaryId: selDrawerSemester,
                    startIdx: 0,
                    endIdx: 99999,
                }
            }
        })
        setWordList(res?.data || []);
    }
    /** 考试名称*/
    const handleExamNameChange = (e: any) => {
        setDrawerExamName(e.target.value);
    };
    /** 时间更改 */
    const handleDateChange = (val:any) => {
        setDrawerStartTime(moment(new Date(val[0]._d) as any).format(dataFormatHms));
        setDrawerEndTime(moment(new Date(val[1]._d) as any).format(dataFormatHms));
    };
    /** 批次更改 */
    const handlePiCiChange = (val:any) => {
        setSelDrawerPici(val);
        setDrawerPageNo(1)
    };
    /** 词库更改*/
    const handleSemesterChange = (val:any) => {
        setSelDrawerSemester(val);
    };
    /** 考试单词个数更改*/
    const handleTestNumChange = (val:any) => {
        setTestNum(val);
    };
    /** 考试时间更改*/
    const handleTestTimeChange = (val:any) => {
        setTestTime(val);
    };

    /** 清空 */
    const handleClearClick = () => {
        setSelDrawerBanji([]);
    };
    /** 班级批量选择 */
    const handleSelBanjiChange = (selectedRowKeys:any, selectedRows:any) => {
        setSelDrawerBanji(selectedRowKeys);
    }
    /** 翻页 */
    const handleNowPagChange = (val:any) => {
        setDrawerPageNo(val)
    };
    /** step1 下一步 */
    const handleStep1Next = () => {
        if(drawerExamName.length === 0){
            message.warning('请输入考试名称');
            return
        }
        
        if(selDrawerBanji.length === 0){
            message.warning('请选择班级');
            return
        }
        setStep(2);
    };
    /** step2 上一步 */
    const handleStep2Prev = () => {
        setStep(1);
    };
    /** 单词选中回调*/
    const handleWordChecked = (val:any) => {
        setCheckedWordList(val)
    };
    /** 顺序选择点击*/
    const handleOrderClick = () => {
        setOrderSignal(orderSignal + 1)
    }
    /** step2 发布 */
    const handleConfirm = () => {
        onSubmit({ drawerExamName, drawerStartTime, drawerEndTime, selDrawerBanji, checkedWordList, selDrawerSemester, testNum, testTime });
    };

    /** 考试名称 */
    const handleDrawerSearchWordChange = (e:any) => {
        setDrawerSearchWord(e.target.value);
    }

    return (
        <Drawer
            title={title}
            visible={visible}
            onClose={onClose}
            width={720}
        >
            <div className={style['word-quiz-drawer']}>
                {step === 1 && (<> 
                    <div className={style['select-box']}>
                        <span className={style['span']}>考试名称:</span>
                        <Input
                            className="gap-8"
                            placeholder="请输入考试名称"
                            value={drawerExamName}
                            onChange={handleExamNameChange}
                            maxLength={200}
                        />
                    </div>
                    <div className={style['select-box-divider']} />
                    <div className={style['select-box']}>
                        <span className={style['span']}>考试时间:</span>
                        <RangePicker
                            defaultValue={[
                                moment(new Date(FunGetDateStr(-6, new Date())), dataFormatHms),
                                moment(new Date(), dataFormatHms),
                            ]}
                            onChange={handleDateChange}
                            format={dataFormatHms}
                        />
                    </div>
                    <Divider />
                    <div className={style['pici-box']}>
                        <div className={style['pici-text']}>选择班级</div>
                        <div className={style['select-box']}>
                            <span className={style['span']}>学员批次:</span>
                            <Select
                                defaultValue="请选择"
                                style={{ width: 180 }}
                                value={selDrawerPici || (drawerPici[0] && (drawerPici[0] as any).describe) || '请选择'}
                                onChange={handlePiCiChange}
                            >
                                {drawerPici.map((item: any) => (
                                    <Option key={item.batchId} value={item.batchId}>
                                        {item.describe}
                                    </Option>
                                ))}
                            </Select>
                        </div>
                    </div>
                    <Alert
                        message={`已选择${selDrawerBanji.length}项`}
                        type="info"
                        showIcon
                        action={
                            <Button type="link" onClick={handleClearClick}>清空</Button>
                        }
                        style={{ marginTop: 16 }}
                    />
                    <div className={style['drawer-banji-table']}>
                        <Table
                            columns={drawerColumns}
                            dataSource={drawerBanji}
                            pagination={false}
                            size={'middle'}
                            bordered={false}
                            rowKey="classId"
                            rowSelection={{
                                type: 'checkbox',
                                selectedRowKeys: selDrawerBanji,
                                preserveSelectedRowKeys: true,
                                onChange: handleSelBanjiChange,
                            }}
                        />
                    </div>
                    <div className={style['drawer-tool']}>
                        <div className={style['drawer-pag']}>
                            <Pagination showQuickJumper defaultCurrent={1} total={drawerAllCount} current={drawerPageNo} pageSize={drawerPageSize} onChange={handleNowPagChange} />
                        </div>
                        <div className={style['drawer-btn']}>
                            <div />
                            <div className={style['drawer-btn-right']}>
                                <Button type="primary" onClick={handleStep1Next} size={'large'} style={{ width: '128px', marginRight: '24px' }}>下一步</Button>
                                <Button onClick={onClose} size={'large'} style={{ width: '128px' }}>取消</Button>
                            </div>
                        </div>
                    </div>
                </>)}
                {step === 2 && (<>
                    <div className={style['select-box']}>
                        <span className={style['span']}>选择词库:</span>
                        <Select
                            defaultValue="请选择"
                            style={{ width: 586 }}
                            value={ selDrawerSemester || '请选择'}
                            onChange={handleSemesterChange}
                        >
                            {drawerSemester.map((item: any) => (
                                <Option key={item.semesterId} value={item.semesterId}>
                                    {item.semesterName}
                                </Option>
                            ))}
                        </Select>
                    </div>
                    <div className={style['set-box']}>
                        <div className={style['select-box']}>
                            <span className={style['span']}>测试题数:</span>
                            <Select
                                style={{ width: 240 }}
                                value={testNum}
                                onChange={handleTestNumChange}
                            >
                                {testNumList.map((item: any) => (
                                    <Option key={item} value={item}>
                                        {`${item}个`}
                                    </Option>
                                ))}
                            </Select>
                        </div>
                        <div className={style['select-box']}>
                            <span className={style['span']}>测试时长:</span>
                            <Select
                                style={{ width: 240 }}
                                value={testTime}
                                onChange={handleTestTimeChange}
                            >
                                {testTimeList.map((item: any) => (
                                    <Option key={item} value={item}>
                                        {`${item}min`}
                                    </Option>
                                ))}
                            </Select>
                        </div>
                    </div>
                    <Divider />
                    <div className={style['set-box']}>
                        <div className={style['select-box']}>
                            <Input
                                className="gap-8"
                                placeholder="请输入单词"
                                value={drawerSearchWord}
                                onChange={handleDrawerSearchWordChange}
                                style={{ width: 272 }}
                            />
                        </div>
                        <Tooltip
                            title={'默认从未考过单词开始依次选择'}
                            trigger="hover"
                            placement="topLeft"
                            color="rgba(0, 0, 0, 0.7)"
                            overlayStyle={{ minWidth: '100px' }}
                        >
                            <Button type="primary" onClick={handleOrderClick} style={{ width: '88px' }}>顺序选择</Button>
                        </Tooltip>
                    </div>
                    <WordSelection wordList={wordList} pageSize={testNum} orderSignal={orderSignal} onChecked={handleWordChecked} />
                    <div className={style['drawer-tool']}>
                        <div className={style['drawer-btn']}>
                            <Button type="primary" onClick={handleStep2Prev} size={'large'} style={{ width: '128px', marginRight: '24px' }}>上一步</Button>
                            <div className={style['drawer-btn-right']}>
                                <Button type="primary" onClick={handleConfirm} size={'large'} style={{ width: '128px', marginRight: '24px' }}>发布</Button>
                                <Button onClick={onClose} size={'large'} style={{ width: '128px' }}>取消</Button>
                            </div>
                        </div>
                    </div>
                </>)}
            </div>
        </Drawer>
    );
};

export default DrawerForm;