import React from 'react';
// import { Row, Col, Tabs, DatePicker, Table } from 'antd';
// import moment from 'moment';
import { PageHeader } from 'antd';
import '../../style/pageStyle/MainSet.less';

const routes = [
    {
        path: '/app/class/main',
        breadcrumbName: 'First-level Menu',
    },
    {
        path: '/class',
        breadcrumbName: 'Second-level Menu',
    },
    {
        path: '/set',
        breadcrumbName: 'Third-level Menu',
    },
];

class MainSet extends React.Component {
    state = {};

    render() {
        return (
            <div className="class-main-wrapper">
                <PageHeader className="site-page-header" title="Title" breadcrumb={{ routes }} />
            </div>
        );
    }
}

export default MainSet;
