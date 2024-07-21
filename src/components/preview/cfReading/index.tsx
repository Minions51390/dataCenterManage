/** 仔细阅读 */
import React from 'react';
import './index.less';

export interface ICfReading {
    dataSource?: any;
}

const CfReading = (props: ICfReading) => {
    const { dataSource = {} } = props;

    let { title, stem, questions } = dataSource;

	stem = `<span style="margin-left: 30px"></span>${stem}`;

	stem = stem.replace(/\n\n/g, '\n');

	stem = stem.replace(/\n/g, '<br/><span style="margin-left: 30px; margin-top: 30px; display: inline-block;"></span>');


    return (
        <div className="preview-cf">
            <div className="title">{title}</div>
            <div className="stem" dangerouslySetInnerHTML={{ __html: stem }} />
            <div className="question">
                {questions.map((item: any, index: number) => {
                    return (
                        <div key={index} className="item">
                            <div>
                                {index + 1}. {item.qStem}
                            </div>
                            {item.options.map((val: any) => {
                                return <div key={val.key} className="answer">{`${val.key}. ${val.value}`}</div>;
                            })}
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

export default CfReading;
