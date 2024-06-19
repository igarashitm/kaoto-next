import { ActionListGroup } from '@patternfly/react-core';
import { FunctionComponent, MouseEvent, KeyboardEvent, useCallback } from 'react';
import { ExpressionInputAction } from './ExpressionInputAction';
import { DeleteMappingItemAction } from './DeleteMappingItemAction';
import { ConditionMenuAction } from './ConditionMenuAction';
import { ExpressionEditorAction } from './ExpressionEditorAction';
import { TargetNodeData } from '../../../models/visualization';
import { VisualizationService } from '../../../services/visualization.service';

type TargetNodeActionsProps = {
  nodeData: TargetNodeData;
  onUpdate: () => void;
};

export const TargetNodeActions: FunctionComponent<TargetNodeActionsProps> = ({ nodeData, onUpdate }) => {
  const expressionItem = VisualizationService.getExpressionItemForNode(nodeData);
  const isDeletable = VisualizationService.isDeletableNode(nodeData);
  const handleStopPropagation = useCallback((event: MouseEvent | KeyboardEvent) => {
    event.stopPropagation();
  }, []);

  return (
    <ActionListGroup
      key={`target-node-actions-${nodeData.id}`}
      onClick={handleStopPropagation}
      onKeyDown={handleStopPropagation}
    >
      {expressionItem && (
        <>
          <ExpressionInputAction mapping={expressionItem} onUpdate={onUpdate} />
          <ExpressionEditorAction nodeData={nodeData} mapping={expressionItem} onUpdate={onUpdate} />
        </>
      )}
      <ConditionMenuAction nodeData={nodeData} onUpdate={onUpdate} />
      {isDeletable && <DeleteMappingItemAction nodeData={nodeData} onDelete={onUpdate} />}
    </ActionListGroup>
  );
};
