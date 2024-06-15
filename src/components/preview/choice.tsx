/** 单选 */
import React from 'react';
import '../../style/pageStyle/choice.less';

export interface IChoice {
    dataSource?: any;
}

const Choice = (props: IChoice) => {
    const { dataSource = {} } = props;

    const { stem, options, rightKey } = dataSource;

    return (
        <div className="preview-choice">
            <div className="title">{stem}</div>
            <div className="options">
                {options.map((item: any) => {
                    return (
                        <div className="item">
                            {item.key}) {item.value}
                        </div>
                    );
                })}
            </div>
            <div className="rightKey">正确答案：{rightKey}</div>
        </div>
    );
};

export default Choice;
