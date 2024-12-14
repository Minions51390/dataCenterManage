import React, { useState, useEffect } from 'react';
import { Drawer, Button, Form, Input, DatePicker, Divider, Alert, Select, Table, Pagination, message } from 'antd';
import { get, baseUrl } from '../../../service/tools';
import { dateFormat, FunGetDateStr } from '../../../utils/date';
import style from './index.module.less';

import moment from 'moment';

const { RangePicker } = DatePicker;
const { Option } = Select;

interface DrawerFormProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (values: { drawerExamName: string; drawerStartTime: string; drawerEndTime: string; selDrawerBanji: number[] }) => void;
    title: string;
}


const DrawerForm: React.FC<DrawerFormProps> = ({ visible, onClose, onSubmit, title }) => {
    const [drawerExamName, setDrawerExamName] = useState('');
    const [drawerStartTime, setDrawerStartTime] = useState(moment().format(dateFormat));
    const [drawerEndTime, setDrawerEndTime] = useState(moment((new Date(FunGetDateStr(7, new Date()) + " 00:00:00") as any)).format(dateFormat));
    const [selDrawerTeacher] = useState({realName:'', teacherId: localStorage.getItem("classTeacherId")});
    const [drawerPici, setDrawerPici] = useState([]);
    const [selDrawerPici, setSelDrawerPici] = useState(0);
    const [drawerBanji, setDrawerBanji] = useState([]);
    const [selDrawerBanji, setSelDrawerBanji] = useState<number[]>([]);
    const [drawerPageNo, setDrawerPageNo] = useState(1);
    const [drawerPageSize, setDrawerPageSize] = useState(20);
    const [drawerAllCount, setDrawerAllCount] = useState(0);

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

    useEffect(() => {
        init();
    }, []);

    useEffect(() => {
        getClass()
    }, [selDrawerPici]);

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

    /* 考试名次%*/
    const handleExamNameChange = (e: any) => {
        setDrawerExamName(e.target.value);
    };
    /** 时间更改 */
    const handleDateChange = (val:any) => {
        setDrawerStartTime(moment(new Date(val[0]._d) as any).format(dateFormat));
        setDrawerEndTime(moment(new Date(val[1]._d) as any).format(dateFormat));
    };
    /** 批次更改 */
    const handlePiCiChange = (val:any) => {
        setSelDrawerPici(val);
    };
    /** 清空 */
    const handleClearClick = () => {
        setSelDrawerBanji([]);
    };
    const handleSelBanjiChange = (selectedRowKeys:any, selectedRows:any) => {
        setSelDrawerBanji(selectedRowKeys);
    }
    /** 翻页 */
    const handleNowPagChange = (val:any) => {
        setDrawerPageSize(val)
    };
    /** 确认 */
    const handleConfirm = () => {
        if(drawerExamName.length === 0){
            message.warning('请输入考试名称');
            return
        }
        
        if(selDrawerBanji.length === 0){
            message.warning('请选择班级');
            return
        }
        onSubmit({
            drawerExamName,
            drawerStartTime,
            drawerEndTime,
            selDrawerBanji,
        });
    };

    return (
        <Drawer
            title={title}
            visible={visible}
            onClose={onClose}
            width={720}
        >
            <div className={style['word-quiz-drawer']}>
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
                <div className={style['select-box']}>
                    <span className={style['span']}>考试时间:</span>
                    <RangePicker
                        defaultValue={[
                            moment(new Date(FunGetDateStr(-6, new Date())), dateFormat),
                            moment(new Date(), dateFormat),
                        ]}
                        onChange={handleDateChange}
                        format={dateFormat}
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
                <div className={style['drawer-table']}>
                    <Table
                        columns={drawerColumns}
                        dataSource={drawerBanji}
                        pagination={false}
                        size={'middle'}
                        bordered={false}
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
                        <Pagination showQuickJumper defaultCurrent={1} total={drawerAllCount} onChange={handleNowPagChange} />
                    </div>
                    <div className={style['drawer-btn']}>
                        <Button type="primary" onClick={handleConfirm} size={'large'} style={{ width: '128px', marginRight: '24px' }}>下一步</Button>
                        <Button onClick={onClose} size={'large'} style={{ width: '128px' }}>取消</Button>
                    </div>
                </div>
            </div>
        </Drawer>
    );
};

export default DrawerForm;