/** 词汇理解 */
import React from 'react';
import './index.less';

export interface IPack {
    dataSource?: any;
}

const Pack = (props: IPack) => {
    const { dataSource = {} } = props;

    let { title, stem, options, rightInfo } = dataSource;

	stem = `<span style="margin-left: 30px"></span>${stem}`;

	stem = stem.replace(/\n\n/g, '\n');

	stem = stem.replace(/\n/g, '<br/><span style="margin-left: 30px; margin-top: 30px; display: inline-block;"></span>');

    return (
        <div className="preview-pack">
            <div className="title">{title}</div>
            <div className="stem" dangerouslySetInnerHTML={{ __html: stem }} />
            <div className="options">
                {options.map((item: any) => {
                    return (
                        <div className="item" key={item.key}>
                            ({item.key}) {item.value}
                        </div>
                    );
                })}
            </div>
            <div className="rightKey">
                正确答案：
                {rightInfo.map((item: any, index: number) => {
                    return (
                        <span key={item} style={{marginRight: '12px'}}>
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
