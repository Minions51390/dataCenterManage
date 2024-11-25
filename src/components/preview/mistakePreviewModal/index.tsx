import React, { useMemo } from "react";
import { Modal, Table } from "antd";
import Choice from '../choice';
import Pack from '../pack';
import CfReading from '../cfReading';
import LongReading from "../longReading";
import { QuestionType, getErrorCount } from "../../../utils/question";

export const MistakePreviewModal = ({ visible, close, previewData }: { visible: boolean, close: () => void, previewData: any }) => {

    const errorCountData = useMemo(() => {
        const { setType } = previewData;
        if (setType === QuestionType.Choice) {
            return [{
                total: getErrorCount(setType, previewData)
            }];
        }

        if (setType === QuestionType.Pack) {
            const obj: Record<any, any> = {};
            previewData?.errorCount?.forEach((item: number, index: number) => {
                obj[`(${index + 1})`] = item;
            });
            obj.total = getErrorCount(setType, previewData);
            return [obj];
        }

        if (setType === QuestionType.LongReading || setType === QuestionType.CfReading) {
            const obj: Record<any, any> = {};
            previewData?.questions?.forEach((item: any, index: any) => {
                obj[`(${index + 1})`] = item.errorCount;
            });
            obj.total = getErrorCount(setType, previewData);
            return [obj];
        }
        return [];
    }, [previewData]);

    const columns = useMemo(() => {
        if (!errorCountData?.length) {
            return [];
        }
        const arr = Object.keys(errorCountData?.[0])?.filter(item => item !== 'total')?.map((item, index) => {
            return {
                title: `(${index + 1})`,
                dataIndex: `(${index + 1})`,
                key: `(${index + 1})`,
            };
        });
        return [
            {
                title: '题号',
                dataIndex: 'questionNumber',
                key: 'questionNumber',
                render: (text: any) => '错题人次'
            },
            ...arr,
            {
                title: '累计',
                dataIndex: 'total',
                key: 'total',
            },
        ];
    }, [errorCountData]);
    return (
        <Modal
            width={900}
            title={previewData.title || (previewData.setType === QuestionType.Choice && '单选题') || ''}
            visible={visible}
            footer={null}
            onCancel={close}
        >
            <div>
                {previewData.setType === QuestionType.Choice && <Choice dataSource={previewData} />}
                {previewData.setType === QuestionType.Pack && <Pack dataSource={previewData} />}
                {previewData.setType === QuestionType.CfReading && <CfReading dataSource={previewData} />}
                {previewData.setType === QuestionType.LongReading && <LongReading dataSource={previewData} />}
            </div>
            <Table
                dataSource={errorCountData}
                columns={columns}
                rowKey="total"
            />
        </Modal>
    );
};