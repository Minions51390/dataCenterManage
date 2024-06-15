import React from 'react';
import './index.less';

export interface IPack {
    dataSource?: any;
}

const Pack = (props: IPack) => {
    const { dataSource = {} } = props;

    const { title, stem, options, rightInfo } = dataSource;

    return (
        <div className="preview-pack">
            <div className="title">{title}</div>
            <div className="stem">{stem}</div>
            <div className="options">
                {options.map((item: any) => {
                    return (
                        <div className="item">
                            ({item.key}) {item.value}
                        </div>
                    );
                })}
            </div>
            <div className="rightKey">
                正确答案：
                {rightInfo.map((item: any, index: number) => {
                    return (
                        <span style={{marginRight: '12px'}}>
                            <span>({index + 1})</span>
                            <span style={{marginLeft: '8px'}}>{item};</span>
                        </span>
                    );
                })}
            </div>
        </div>
    );
};

export default Pack;
