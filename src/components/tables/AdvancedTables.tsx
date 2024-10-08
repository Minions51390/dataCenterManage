import React from 'react';
import { Row, Col, Card } from 'antd';
import FixedTable from './FixedTable';
import ExpandedTable from './ExpandedTable';
import BreadcrumbCustom from '../widget/BreadcrumbCustom';

class AdvancedTables extends React.Component {
    render() {
        return (
            <div className="gutter-example">
                <BreadcrumbCustom breads={['表格', '高级表格']} />
                <Row gutter={16}>
                    <Col className="gutter-row" md={24}>
                        <div className="gutter-box">
                            <Card title="固定列" bordered={false}>
                                <FixedTable />
                            </Card>
                        </div>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col className="gutter-row" md={12}>
                        <div className="gutter-box">
                            <Card title="可展开" bordered={false}>
                                <ExpandedTable />
                            </Card>
                        </div>
                    </Col>
                    {/* <Col className="gutter-row" md={12}>
                        <div className="gutter-box">
                            <Card title="可编辑" bordered={false}>
                                <EditableTable />
                            </Card>
                        </div>
                    </Col> */}
                </Row>
            </div>
        );
    }
}

export default AdvancedTables;
