/** 长篇阅读 */
import React from 'react';
import './index.less';

export interface ILong {
    dataSource?: any;
}

const LongReading = (props: ILong) => {
    const { dataSource = {} } = props;

    const { title, topic, options, questions } = dataSource;

    return (
        <div className="preview-long">
            <div className="title">{title}</div>
            <div className="topic">{topic}</div>
            <div className="options">
                {options.map((item: any) => {
                    return (
                        <div key={item.key} className="item">
                            {item.key}) {item.value}
                        </div>
                    );
                })}
            </div>
            <div className="question">
                {questions.map((item: any, index: number) => {
                    return (
                        <div key={index} className="item">
                            {index + 1}. {item.qStem}
                        </div>
                    );
                })}
            </div>
            <div className="rightKey">
                正确答案：
                {questions.map((item: any, index: number) => {
                    return (
                        <span key={index} style={{ marginRight: '12px' }}>
                            <span>({index + 1})</span>
                            <span style={{ marginLeft: '8px' }}>{item.rightKey};</span>
                        </span>
                    );
                })}
            </div>
        </div>
    );
};

export default LongReading;
