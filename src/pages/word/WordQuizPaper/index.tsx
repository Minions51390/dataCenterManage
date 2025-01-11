import React, { useState, useEffect, useCallback } from'react';
import { Table, Input, Select, Pagination, message, Tooltip, DatePicker, Button, PageHeader } from 'antd';
import style from './index.module.less';
import { get, post, baseUrl } from '../../../service/tools';
import { withRouter } from 'react-router-dom';
import { getQueryString } from '../../../utils';

const WordQuizDetail: React.FC = (props:any) => {
    const {wordTestId, paperId} = getQueryString();
    const routes = [
        {
            path: '/app/wordCenter/wordQuiz',
            breadcrumbName: '单词小测',
        },
        {
            // path: '/wordQuizDetail',
            path: `/wordQuizDetail?wordTestId=${wordTestId}`,
            breadcrumbName: '小测详情',
        },
        {
            path: '/wordQuizPaper',
            breadcrumbName: `卷面详情`,
        },
    ];
    
    useEffect(() => {
        init();
    }, []);

    /** 初始化函数，异步获取详情数据和表格数据 */
    const init = async () => {
        
    };

    return (
        <div className={style['word-quiz-paper']}>
            <div className={style['header']}>
                <PageHeader title="" breadcrumb={{ routes }} />
                <div className={style['header-title']}>单词小测</div>
            </div>
        </div>
    )
};

export default withRouter(WordQuizDetail);