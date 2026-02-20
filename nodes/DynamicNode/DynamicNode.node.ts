import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  NodeOperationError,
  NodeConnectionTypes,
} from 'n8n-workflow';
import { v4 as uuidv4 } from 'uuid';
import subWorkflowTemplate from './subWorkflowTemplate.json';

export class DynamicNode implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Dynamic Node',
    name: 'dynamicNode',
    icon: 'file:dynamicNode.svg',
    group: ['transform'],
    version: 1,
    description: 'Dynamically execute any node JSON within your workflow',
    defaults: { name: 'Dynamic Node' },
    inputs: [NodeConnectionTypes.Main],
    outputs: [NodeConnectionTypes.Main],
    properties: [
      {
        displayName: 'Node JSON',
        name: 'nodeJson',
        type: 'json',
        default: {},
        description: 'Paste in your exported node JSON here',
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();

    // ✅ Enforce: exactly 1 item per call
    if (items.length !== 1) {
      throw new NodeOperationError(
        this.getNode(),
        `Dynamic Node must be called with exactly 1 item. Received ${items.length}.`,
      );
    }

    const rawParam = this.getNodeParameter('nodeJson', 0) as any;
    let raw: any;

    if (typeof rawParam === 'string') {
      try {
        raw = JSON.parse(rawParam);
      } catch {
        throw new NodeOperationError(
          this.getNode(),
          'Node JSON must be a valid JSON object or a parseable JSON string',
        );
      }
    } else {
      raw = rawParam;
    }

    if (typeof raw !== 'object' || raw === null) {
      throw new NodeOperationError(this.getNode(), 'Node JSON must be an object');
    }

    const nodeJson = Array.isArray(raw.nodes) && raw.nodes.length > 0 ? raw.nodes[0] : raw;

    delete nodeJson.connections;
    delete nodeJson.pinData;
    delete nodeJson.meta;

    if (!nodeJson.name) {
      throw new NodeOperationError(this.getNode(), 'Your JSON must include a `name` field');
    }

    nodeJson.name = `${nodeJson.name} - Dynamic Node`;
    nodeJson.id = `dynamic-${uuidv4()}`;
    nodeJson.position = [240, 0];

    const template = JSON.parse(JSON.stringify(subWorkflowTemplate));
    template.nodes.push(nodeJson);
    template.connections['Execute Workflow Trigger'].main[0][0].node = nodeJson.name;

    const workflowProxy = this.getWorkflowDataProxy(0);

    const executionResult: any = await this.executeWorkflow(
      { code: template },
      items,
      {},
      {
        parentExecution: {
          executionId: workflowProxy.$execution.id,
          workflowId: workflowProxy.$workflow.id,
        },
        doNotWaitToFinish: false,
      },
    );

    let returnedData: INodeExecutionData[][] = [];

    if (Array.isArray(executionResult)) {
      returnedData = executionResult as INodeExecutionData[][];
    } else if (executionResult && typeof executionResult === 'object' && 'data' in executionResult) {
      if (Array.isArray((executionResult as any).data)) {
        returnedData = (executionResult as any).data as INodeExecutionData[][];
      } else {
        this.logger.warn('DynamicNode: Sub-workflow executionResult.data was not an array. Returning empty data.');
      }
    } else if (executionResult === null || executionResult === undefined) {
      this.logger.warn('DynamicNode: Sub-workflow executionResult was null or undefined. Returning empty data.');
    } else {
      this.logger.warn(`DynamicNode: Unexpected structure from sub-workflow execution. Type: ${typeof executionResult}. Returning empty data.`);
    }

    return returnedData;
  }
}
