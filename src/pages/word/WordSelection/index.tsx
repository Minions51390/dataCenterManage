import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { Checkbox, Row, Col, Tag, Alert, Button } from 'antd';
import { TweenOneGroup } from 'rc-tween-one';
import style from './index.module.less';
import { RightOutlined } from '@ant-design/icons';

interface RangeItem {
    start: number;
    end: number;
    text: string;
    page: number;
}

interface WordItem {
    word: string;
    wordId: number;
    meaning: string;
}

interface Props {
    wordList: WordItem[];
    pageSize?: number;
    orderSignal?: number;
    onChecked: (checkedList: any[]) => void;
}

const WordSelection: React.FC<Props> = ({ wordList, pageSize = 20, onChecked, orderSignal }) => {
    const [rangeList, setRangeList] = useState<RangeItem[]>([]);
    const [rangePage, setRangePage] = useState(1);
    const [checkedList, setCheckedList] = useState<WordItem[]>([]);
    const [checkedListId, setCheckedListId] = useState<number[]>([]);

    useEffect(() => {
        init();
    }, [pageSize]);

    useEffect(() => {
        const itemMap = new Map();
        wordList.forEach((obj) => {
            itemMap.set(obj.wordId, obj);
        });

        const result: WordItem[] = checkedListId.map((wordId) => {
            return itemMap.get(wordId) || null;
        }).filter((item) => item!== null) as WordItem[];

        setCheckedList(result);
    }, [checkedListId, wordList]);

    useEffect(() => {
        if(orderSignal && orderSignal > 0){
            const toBeAddNum = pageSize - checkedListId.length;
            const toBeAddWordId = [];

            // 创建一个已选id的集合，方便后续快速判断元素是否已选
            const selectedIdSet = new Set(checkedListId);

            // 遍历wordList，按照顺序添加未选中的id，直到达到需要添加的数量
            for (const wordItem of wordList) {
                if (!selectedIdSet.has(wordItem.wordId) && toBeAddWordId.length < toBeAddNum) {
                    toBeAddWordId.push(wordItem.wordId);
                }
            }
            // 将新添加的id合并到已选中的id列表中
            const newCheckedListId = [...checkedListId,...toBeAddWordId];
            setCheckedListId(newCheckedListId);
        }
    }, [orderSignal]);

    /** 初始化 */
    const init = () => {
        const rangeList = [];
        const totalPages = Math.ceil(wordList.length / pageSize);
        for (let i = 0; i < totalPages; i++) {
            const start = i * pageSize + 1;
            const end = Math.min(start + pageSize - 1, wordList.length);
            rangeList.push({
                start,
                end,
                text: `${start}~${end}`,
                page: i + 1,
            });
        }
        setRangeList(rangeList);
    }

    /** 单词范围更改 */
    const handleRangeChange = (range: any) => {
        setRangePage(range.page);
        const div = document.getElementsByClassName('ant-row')[0];
        const toDiv = div.children[(range.page - 1) * pageSize];
        toDiv.scrollIntoView({
            behavior:'smooth',
            block:'start'
        });
    };

    /** 单词变化 */
    const handleCheckboxChange = (checkedListId: any[]) => {
        setCheckedListId(checkedListId);
        onChecked(checkedListId);
    };

    /** 清空所选项 */
    const handleClearClick = () => {
        setCheckedListId([]);
    }

    /** Tag改变 */
    const handleTagClose = (val: number) => { // 明确参数类型为number，保持一致性
        const newCheckedListId = checkedListId.filter(item => item!== val); // 创建新的checkedListId数组
        setCheckedListId(newCheckedListId);
        const newCheckedList = checkedList.filter(item => item.wordId!== val); // 同时更新checkedList
        setCheckedList(newCheckedList);
    }

    return (
        <div className={style['word-selection']}>
            <div className={style['word-checkbox']}>
                <div className={style['word-range']}>
                    <div className={style['word-range-title']}>选词范围</div>
                    {rangeList.map((range) => (
                        <div className={`${style['word-range-item']} ${rangePage === range.page? style['word-range-item-active'] : ''}`} onClick={() => handleRangeChange(range)}>
                            {range.text}
                            <RightOutlined />
                        </div>
                    ))}
                </div>
                <div className={style['word-check']}>
                    <div className={style['word-check-title']}>单词列表</div>
                    <Checkbox.Group onChange={handleCheckboxChange} value={checkedListId}>
                        <Row>
                            {wordList.map((item, index) => (
                                <Col span={12} key={item.wordId}>
                                    <div className={style['word-check-item']}>
                                        <Checkbox key={item.wordId} value={item.wordId}>
                                            <div className={style['word-check-box']}>
                                                <div className={style['word-check-item-index']}>{index + 1}</div>
                                                <div className={style['word-check-item-right']}>
                                                    <div className={style['item-word']}>{item.word}</div>
                                                    <div className={style['item-meaning']}>{item.meaning}</div>
                                                </div>
                                            </div>
                                        </Checkbox>
                                    </div>
                                </Col>
                            ))}
                        </Row>
                    </Checkbox.Group>
                </div>
            </div>
            <Alert
                message={`已选择${checkedList.length}项`}
                type="info"
                showIcon
                action={
                    <Button type="link" onClick={handleClearClick}>清空</Button>
                }
                style={{ marginTop: 16 }}
            />
            <div className={style['word-select']}>
                {checkedList.map((item, index) => (
                    <Tag style={{ marginTop: 8, padding: '4px 8px' }} closable key={item.wordId} onClose={() => handleTagClose(item.wordId)}> 
                        {item.word}
                    </Tag>
                ))}
            </div>
        </div>
    );
};

export default WordSelection;