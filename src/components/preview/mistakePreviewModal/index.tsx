import React from "react";
import { Modal } from "antd";
import Choice from '../choice';
import Pack from '../pack';
import CfReading from '../cfReading';
import LongReading from "../longReading";
import { QuestionType } from "../../../utils/question";

export const MistakePreviewModal = ({ visible, close, previewData }: { visible: boolean, close: () => void, previewData: any }) => {
    return (
        <Modal
            title={previewData.title}
            visible={visible}
            footer={null}
            onCancel={close}
        >
            {previewData.setType === QuestionType.Choice && <Choice dataSource={previewData} />}
            {previewData.setType === QuestionType.Pack && <Pack dataSource={previewData} />}
            {previewData.setType === QuestionType.CfReading && <CfReading dataSource={previewData} />}
            {previewData.setType === QuestionType.LongReading && <LongReading dataSource={previewData} />}
        </Modal>
    );
};