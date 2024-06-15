import React from 'react';
import './index.less';

export interface ICfReading {
    dataSource?: any;
}

const CfReading = (props: ICfReading) => {
    const { dataSource = {} } = props;

    const { title, stem, questions } = dataSource;

    console.log(123123, dataSource);

    return (
        <div className="preview-cf">
            <div className="title">{title}</div>
            <div className="stem">{stem}</div>
            <div className="question">
                {questions.map((item: any, index: number) => {
                    return (
                        <div className="item">
                            <div>
                                ({index + 1}) {item.qStem}
                            </div>
                            {item.options.map((val: any) => {
                                return <div className="answer">{`(${val.key})${val.value}`}</div>;
                            })}
                        </div>
                    );
                })}
            </div>
            <div className="rightKey">
                正确答案：
                {questions.map((item: any, index: number) => {
                    return (
                        <span style={{ marginRight: '12px' }}>
                            <span>({index + 1})</span>
                            <span style={{ marginLeft: '8px' }}>{item.rightKey};</span>
                        </span>
                    );
                })}
            </div>
        </div>
    );
};

export default CfReading;
