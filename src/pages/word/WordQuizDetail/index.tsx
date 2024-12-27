import React, { useState, useEffect, useCallback } from'react';
import { Table, Input, Select, Pagination, message, Tooltip, DatePicker, Button, PageHeader } from 'antd';
import style from './index.module.less';
import { get, post, baseUrl } from '../../../service/tools';
import Highlighter from "react-highlight-words";
import { getQueryString } from '../../../utils';

// 明确WordDetail接口的各属性类型
interface WordDetail {
    wordTestName?: string;
    wordOriginDic?: string;
    creator?: string;
    count?: number;
    startTime?: string;
    endTime?: string;
    status?: number;
}

// 明确WordTable接口各属性类型，并确保其结构一致性
interface WordTable {
    score: any;
    paperId?: number;
    studentName?: string;
    submitTime?: string;
    batchName?: string;
    className?: string;
}

const WordQuizDetail: React.FC = () => {
    const routes = [
        {
            path: '/app/wordCenter/wordQuiz',
            breadcrumbName: '单词小测',
        },
        {
            path: '/app/wordCenter/wordQuizDetail',
            breadcrumbName: `单词小测详情`,
        },
    ];
    const [searchQuery, setSearchQuery] = useState('');
    const [wordDetail, setWordDetail] = useState<WordDetail>({});
    const [wordTable, setWordTable] = useState<WordTable[]>([]);
    const [filteredWordTable, setFilteredWordTable] = useState<WordTable[]>([]);
    // 初始的表格列配置
    const initialColumns: Array<{
        title: string;
        dataIndex?: string;
        key?: string;
        sorter?: (a: WordTable, b: WordTable) => number;
        render?: (text: any, record: WordTable, index: number) => React.ReactNode;
        filters?: Array<{ text: string; value: string | number | boolean }>;
        onFilter?: (value: string | number | boolean, record: WordTable) => boolean;
    }> = [
        {
            title: '序号',
            key: 'key',
            render: (text: any, record: WordTable, index: number) => <div>{index + 1}</div>,
        },
        {
            title: '学生姓名',
            key: 'studentName',
            dataIndex: 'studentName',
            // TODO: Highlighter未生效，待排查，可能与currentColumns有关
            render: useCallback((text: string) => {
                console.log('searchQuery in studentName render', searchQuery); // 这里拿到的是空
                return (
                    <Highlighter
                        searchWords={[searchQuery]}
                        autoEscape
                        textToHighlight={text}
                    />
                );
            }, [searchQuery]) 
        },
        {
            title: '考试成绩',
            dataIndex: 'score',
            key: 'score',
            sorter: (a: WordTable, b: WordTable) => a.score - b.score,
        },
        {
            title: '考试时间',
            dataIndex: 'submitTime',
            key: 'submitTime',
        },
        {
            title: '学员批次',
            dataIndex: 'batchName',
            key: 'batchName',
            filters: [],
            onFilter: (value, record) => record.batchName === value,
        },
        {
            title: '学员班级',
            dataIndex: 'className',
            key: 'className',
            filters: [],
            onFilter: (value, record) => record.className === value,
        },
        {
            title: '操作',
            key: 'control',
            render: (text: any) => (
                <div className={style['edit']}>
                    <div onClick={() => handleDetailClick(text.wordTestId)}>详情</div>
                </div>
            ),
        },
    ];
    const [currentColumns, setCurrentColumns] = useState<typeof initialColumns>(initialColumns);

    useEffect(() => {
        init();
    }, []);

    /** 初始化函数，异步获取详情数据和表格数据 */
    const init = async () => {
        const wordTestId = decodeURI(getQueryString().wordTestId || '');
        const detailData = await getWordQuizDetail(wordTestId);
        setWordDetail(detailData);

        const tableData = await getWordQuizTable(wordTestId);
        setWordTable(tableData);

        const batchNameFilters = generateFilters(tableData, 'batchName' as keyof WordTable);
        const classNameFilters = generateFilters(tableData, 'className' as keyof WordTable);

        // 更新列配置中的filters属性
        const updatedColumns = currentColumns.map(column => {
            if (column.dataIndex === 'batchName') {
                return {
                  ...column,
                    filters: batchNameFilters
                };
            }
            if (column.dataIndex === 'className') {
                return {
                  ...column,
                    filters: classNameFilters
                };
            }
            return column;
        });

        setCurrentColumns(updatedColumns);

        // 初始时将筛选后的数据设置为全部数据
        setFilteredWordTable(tableData);
    };

    /**
     * 提取生成指定列筛选选项的函数，通过将Set转换为数组解决低版本编译目标下的循环问题，增强代码复用性
     * @param data 表格数据数组
     * @param columnName 要生成筛选选项的列名
     */
    const generateFilters = (data: WordTable[], columnName: keyof WordTable): Array<{ text: string; value: string }> => {
        const uniqueValues: string[] = [];
        const valueSet = new Set<string>();
        data.forEach((item) => {
            const value = item[columnName];
            if (value!== undefined && value!== null) {
                const stringValue = String(value);
                if (!valueSet.has(stringValue)) {
                    valueSet.add(stringValue);
                    uniqueValues.push(stringValue);
                }
            }
        });
        return uniqueValues.map(name => ({
            text: name,
            value: name
        }));
    };

    /** 获取单词小测详情数据的函数 */
    const getWordQuizDetail = async (wordTestId: string): Promise<WordDetail> => {
        // 这里假设实际请求获取数据，目前模拟返回数据结构
        return {
            wordTestName: "xxxx",
            wordOriginDic: "xxxx",
            creator: "xxxxxx",
            count: 20,
            startTime: "0000-00-00 00:00:00",
            endTime: "0000-00-00 00:00:00",
            status: 1
        };
    };

    /** 获取表格数据的函数 */
    const getWordQuizTable = async (wordTestId: string): Promise<WordTable[]> => {
        // 这里假设实际请求获取数据，目前模拟返回数据结构
        return [
            {
                paperId: 12,
                studentName: "yajie",
                score: 90,
                submitTime: "0000-00-00 00:00:00",
                batchName: "xxxx",
                className: "xxxx"
            },
            {
                paperId: 12,
                studentName: "haha",
                score: 98,
                submitTime: "0000-00-00 00:00:00",
                batchName: "xxxx",
                className: "xxxx"
            },
            {
                paperId: 12,
                studentName: "xxx",
                score: 1,
                submitTime: "0000-00-00 00:00:00",
                batchName: "123",
                className: "xxxx"
            },
            {
                paperId: 12,
                studentName: "xxx",
                score: 8,
                submitTime: "0000-00-00 00:00:00",
                batchName: "12",
                className: "xxxx"
            },
            {
                paperId: 12,
                studentName: "xxx",
                score: 9,
                submitTime: "0000-00-00 00:00:00",
                batchName: "12",
                className: "123"
            }
        ];
    };

    /** 搜索框值更改函数，接收React.ChangeEvent<HTMLInputElement>类型参数 */
    const searchQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newQuery = e.target.value;
        setSearchQuery(newQuery);

        filterTableData(newQuery);
    };

    useEffect(() => {
        console.log('searchQuery in useEffect:', searchQuery);
        // 在这里可以添加依赖于searchQuery更新后的值而要执行的逻辑，比如重新筛选表格数据等
    }, [searchQuery]);

    /**
     * 根据输入的查询值筛选表格数据的函数
     * @param query 查询字符串
     */
    const filterTableData = (query: string) => {
        if (query === '') {
            // 如果查询值为空，显示全部数据
            setFilteredWordTable(wordTable);
            return;
        }

        const filteredData = wordTable.filter((record) => {
            return record.studentName?.toLowerCase().includes(query.toLowerCase());
        });

        setFilteredWordTable(filteredData);
    };

    /** 表格排序函数，处理分页、筛选、排序等变化，各参数类型明确 */
    const tableChange = (pagination: any, filters: any, sorter: any, extra: any) => {
    };

    /** 跳转卷面详情函数，参数wordTestId类型需根据实际情况确定，这里暂未细化 */
    const handleDetailClick = (wordTestId: any) => {
    };

    return (
        <div className={style['word-quiz-detail']}>
            <div className={style['header']}>
                <PageHeader title="" breadcrumb={{ routes }} />
                <div className={style['header-title']}>单词抽测</div>
                <div className={style['header-content']}>
                    <div className={style['header-content-box']}>
                        <div className="header-content-text">创建人：<span>{wordDetail.creator}</span></div>
                        <div className="header-content-text">发布时间：<span>{wordDetail.startTime}</span></div>
                    </div>
                    <div className={style['header-content-box']}>
                        <div className="header-content-text">单词来源：<span>{wordDetail.wordOriginDic}</span></div>
                        <div className="header-content-text">截止时间：<span>{wordDetail.endTime}</span></div>
                    </div>
                    <div className={style['header-content-box']}>
                        <div className="sp">试卷题数</div>
                        <div className="hard">{wordDetail.count}个</div>
                    </div>
                </div>
            </div>
            <div className={style['content']}>
                <div className={style['content-tool']}>
                    <Input
                        style={{ width: '240px' }}
                        placeholder="请输入学生名称"
                        value={searchQuery}
                        onChange={searchQueryChange}
                    />
                </div>
                <div className={style['content-table']}>
                    <Table
                        columns={currentColumns}
                        dataSource={filteredWordTable}
                        pagination={false}
                        size={'middle'}
                        bordered={false}
                        onChange={tableChange}
                    />
                </div>
            </div>
        </div>
    )
};

export default WordQuizDetail;