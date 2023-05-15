import {MarkerType} from "@vue-flow/core";

const operatorAttributes = ref({});

const setOperatorDetailInfo = (attributes: {}) => {
    operatorAttributes.value = attributes
}

const getOperatorDetailInfo = () => {
    return operatorAttributes.value;
}

const createEdge = (params: any) => {
    return {
        id: "dndedge_" +new Date().getTime(),
        source: params.source,
        sourceHandle: params.sourceHandle,
        target: params.target,
        targetHandle: params.targetHandle,
        type: "custom",
        data: { text: "TEST" },
        markerEnd: MarkerType.ArrowClosed
    };
}

const setOperatorDataTransfer = (nodeCategory: string, nodeAttributes: any): OperatorDataTransfer => {
    return {
        operatorLabel: nodeCategory+ "." + nodeAttributes.operatorName,
        operatorName: nodeAttributes.operatorName,
        operatorAttributes: JSON.stringify(nodeAttributes.attributes)
    }
}

interface OperatorDataTransfer {
    operatorLabel: string,
    operatorName: string,
    operatorAttributes: string
}

export { setOperatorDataTransfer, createEdge, setOperatorDetailInfo, getOperatorDetailInfo };
export default OperatorDataTransfer;