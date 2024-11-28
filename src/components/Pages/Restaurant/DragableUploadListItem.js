import { Tooltip } from 'antd';
import React, { } from 'react';
import { useDrag, useDrop } from 'react-dnd';


const type = 'DragableUploadList';

const DragableUploadListItem = ({ originNode, moveRow, file, fileList }) => {
    const ref = React.useRef();
    const index = fileList.indexOf(file);
    const [{ isOver, dropClassName }, drop] = useDrop({
        accept: type,
        collect: monitor => {
            const { index: dragIndex } = monitor.getItem() || {};
            if (dragIndex === index) {
                return {};
            }
            return {
                isOver: monitor.isOver(),
                dropClassName: dragIndex < index ? ' drop-over-downward' : ' drop-over-upward',
            };
        },
        drop: item => {
            moveRow(item.index, index);
        },
    });
    const [, drag] = useDrag({
        type,
        item: { index },
        collect: monitor => ({
            isDragging: monitor.isDragging(),
        }),
    });
    drop(drag(ref));
    const errorNode = <Tooltip title="Upload Error">{originNode.props.children}</Tooltip>;
    return (
        <div
            ref={ref}
            className={`ant-upload-draggable-list-item ${isOver ? dropClassName : ''}`}
            style={{ cursor: 'move' }}
        >
            {file.status === 'error' ? errorNode : originNode}
        </div>
    );
};

export default DragableUploadListItem