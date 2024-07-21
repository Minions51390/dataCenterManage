import React from 'react';
import styles from './index.module.less';

interface QuestionData {
    data: any
}

export const Choice = ({ data }: QuestionData) => {
    const { options, stem } = data;
    return (
        <div>
            <div>{stem}</div>
            <div className={styles.choiceWrapper}>{options.map((item: any) => {
                return <div key={item.key} className={styles.choiceItem}>{item.key}: {item.value}</div>
            })}</div>
        </div>
    )
};

export const Pack = ({ data }: QuestionData) => {
    const { title, stem } = data;
    return (
        <div>
            <div>{title}</div>
            <div className={styles.lineClamp}>{stem.replace(/\\([A-Z]*\\)/g, ' ')}</div>
        </div>
    )
}

export const LongReading = ({ data }: QuestionData) => {
    const { title, topic, options } = data;
    return (
        <div>
            <div>{title}</div>
            <div>{topic}</div>
            <div className={styles.lineClamp}>{options?.[0]?.value}</div>
        </div>
    );
}

export const CfReading = ({ data }: QuestionData) => {
    const { title, stem } = data;
    return (
        <div>
            <div>{title}</div>
            <div className={styles.lineClamp}>{stem}</div>
        </div>
    );
}