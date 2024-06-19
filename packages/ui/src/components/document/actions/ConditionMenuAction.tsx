import { FunctionComponent, Ref, MouseEvent, useCallback, useState } from 'react';
import { MappingNodeData, TargetFieldNodeData, TargetNodeData } from '../../../models/visualization';
import { VisualizationService } from '../../../services/visualization.service';
import {
  ActionListItem,
  Dropdown,
  DropdownItem,
  DropdownList,
  MenuToggle,
  MenuToggleElement,
} from '@patternfly/react-core';
import { EllipsisVIcon } from '@patternfly/react-icons';
import { ChooseItem } from '../../../models/mapping';
import { MappingService } from '../../../services/mapping.service';
import { useDataMapper } from '../../../hooks';

type ConditionMenuProps = {
  nodeData: TargetNodeData;
  onUpdate: () => void;
};

export const ConditionMenuAction: FunctionComponent<ConditionMenuProps> = ({ nodeData, onUpdate }) => {
  const [isActionMenuOpen, setIsActionMenuOpen] = useState<boolean>(false);
  const onToggleActionMenu = useCallback(() => setIsActionMenuOpen(!isActionMenuOpen), [isActionMenuOpen]);
  const { mappingTree } = useDataMapper();
  const allowIfChoose = VisualizationService.allowIfChoose(nodeData);
  const allowForEach = VisualizationService.allowForEach(nodeData);
  const isChooseNode = nodeData instanceof MappingNodeData && nodeData.mapping instanceof ChooseItem;
  const otherwiseItem = isChooseNode && (nodeData.mapping as ChooseItem).otherwise;
  const allowValueSelector = VisualizationService.allowValueSelector(nodeData);
  const hasValueSelector = VisualizationService.hasValueSelector(nodeData);
  const isValueSelectorNode = VisualizationService.isValueSelectorNode(nodeData);

  const onSelectAction = useCallback(
    (_event: MouseEvent | undefined, value: string | number | undefined) => {
      switch (value) {
        case 'selector':
          VisualizationService.applyValueSelector(nodeData);
          break;
        case 'if':
          VisualizationService.applyIf(nodeData);
          break;
        case 'choose':
          VisualizationService.applyChoose(nodeData);
          break;
        case 'foreach':
          MappingService.wrapWithForEach(mappingTree, (nodeData as TargetFieldNodeData).field);
          break;
        case 'when':
          MappingService.addWhen(nodeData.mapping as ChooseItem);
          break;
        case 'otherwise':
          MappingService.addOtherwise(nodeData.mapping as ChooseItem);
          break;
      }
      onUpdate();
      setIsActionMenuOpen(false);
    },
    [mappingTree, nodeData, onUpdate],
  );

  return (
    !isValueSelectorNode && (
      <ActionListItem key="transformation-actions">
        <Dropdown
          onSelect={onSelectAction}
          toggle={(toggleRef: Ref<MenuToggleElement>) => (
            <MenuToggle
              ref={toggleRef}
              onClick={onToggleActionMenu}
              variant="plain"
              isExpanded={isActionMenuOpen}
              aria-label="Transformation Action list"
            >
              <EllipsisVIcon />
            </MenuToggle>
          )}
          isOpen={isActionMenuOpen}
          onOpenChange={(isOpen: boolean) => setIsActionMenuOpen(isOpen)}
          zIndex={100}
        >
          <DropdownList>
            {allowValueSelector && (
              <DropdownItem key="selector" value="selector" isDisabled={hasValueSelector}>
                Add selector expression
              </DropdownItem>
            )}
            {isChooseNode ? (
              <>
                <DropdownItem key="when" value="when">
                  Add <q>when</q>
                </DropdownItem>
                <DropdownItem key="otherwise" value="otherwise" isDisabled={!!otherwiseItem}>
                  Add <q>otherwise</q>
                </DropdownItem>
              </>
            ) : (
              <>
                {allowForEach && (
                  <DropdownItem key="foreach" value="foreach">
                    Wrap with <q>for-each</q>
                  </DropdownItem>
                )}
                {allowIfChoose && (
                  <>
                    <DropdownItem key="if" value="if">
                      Wrap with <q>if</q>
                    </DropdownItem>
                    <DropdownItem key="choose" value="choose">
                      Wrap with <q>choose</q>
                    </DropdownItem>
                  </>
                )}
              </>
            )}
          </DropdownList>
        </Dropdown>
      </ActionListItem>
    )
  );
};
