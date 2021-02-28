import React from 'react';
import ReactEcharts from 'echarts-for-react';
// import echarts from 'echarts';

const option = {
    tooltip: {
        trigger: 'axis',
    },
    legend: {
        data: ['你的评分', '同期最优评分', '同期平均分'],
        left: 'left',
    },
    grid: {
        left: '0',
        right: '0',
        bottom: '0',
        containLabel: true,
    },
    toolbox: {
        feature: {
            saveAsImage: {},
        },
    },
    xAxis: {
        type: 'category',
        data: ['2020/01', '2020/02', '2020/03', '2020/04', '2020/05', '2020/06'],
    },
    yAxis: {
        type: 'value',
    },
    series: [
        {
            name: '你的评分',
            type: 'line',
            smooth: true,
            data: [50, 75, 35, 52, 40, 52],
        },
        {
            name: '同期最优评分',
            type: 'line',
            smooth: true,
            data: [100, 80, 75, 90, 60, 90],
        },
        {
            name: '同期平均分',
            type: 'line',
            smooth: true,
            lineStyle: {
                type: 'dashed',
            },
            data: [80, 65, 50, 80, 60, 90],
        },
    ],
};

const EchartsViews = () => (
    <ReactEcharts
        option={option}
        style={{ height: '260px', width: '100%' }}
        className={'react_for_echarts'}
    />
);

export default EchartsViews;
