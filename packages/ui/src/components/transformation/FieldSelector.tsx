import { IField } from '../../models';
import { FunctionComponent, Ref, useEffect, useMemo, useRef, useState } from 'react';
import {
  Button,
  Divider,
  InputGroup,
  InputGroupItem,
  MenuToggle,
  MenuToggleElement,
  Select,
  SelectGroup,
  SelectList,
  SelectOption,
  SelectOptionProps,
  TextInputGroup,
  TextInputGroupMain,
  TextInputGroupUtilities,
  Tooltip,
} from '@patternfly/react-core';
import { TimesIcon } from '@patternfly/react-icons';
import { useDataMapper } from '../../hooks';
import { DocumentService } from '../../services/document.service';

type FieldOptionProps = SelectOptionProps & {
  functionGroup: string;
  displayName: string;
  descriptionString: string;
  functionDefinition: IFunctionDefinition;
};
const allFieldOptions = Object.keys(functionDefinitions).reduce((acc, value) => {
  return functionDefinitions[value as FunctionGroup].reduce((acc2, func) => {
    acc2.push({
      value: func.name,
      children: func.displayName,
      displayName: func.displayName,
      description: func.description,
      descriptionString: func.description,
      functionGroup: value,
      functionDefinition: func,
    });
    return acc2;
  }, acc);
}, [] as FieldOptionProps[]);

type FieldSelectorProps = {
  onSelect: (field: IField) => void;
};

export const FieldSelector: FunctionComponent<FieldSelectorProps> = ({ onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<string>('');
  const [inputValue, setInputValue] = useState<string>('');
  const [filterValue, setFilterValue] = useState<string>('');
  const [allFieldOptions, setAllFieldOptions] = useState<FieldOptionProps[]>([]);
  const [filteredFieldOptions, setFilteredFieldOptions] = useState<FieldOptionProps[]>([]);
  const [focusedItemIndex, setFocusedItemIndex] = useState<number | null>(null);
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const textInputRef = useRef<HTMLInputElement>();

  const { sourceParameterMap, sourceBodyDocument } = useDataMapper();

  useEffect(() => {
    const sourceBodyFields = DocumentService.getAllFields(sourceBodyDocument);
  }, [sourceParameterMap, sourceBodyDocument]);

  useEffect(() => {
    let newFunctionOptions = allFieldOptions;
    if (filterValue) {
      newFunctionOptions = allFieldOptions.filter((option) => {
        return (
          option.functionGroup.includes(filterValue) ||
          option.value.includes(filterValue) ||
          option.displayName.includes(filterValue) ||
          option.descriptionString.includes(filterValue)
        );
      });

      // Open the menu when the input value changes and the new value is not empty
      if (!isOpen) {
        setIsOpen(true);
      }
    }

    setFilteredFieldOptions(newFunctionOptions);
    setActiveItem(null);
    setFocusedItemIndex(null);
  }, [filterValue, isOpen]);

  const onToggleClick = () => {
    setIsOpen(!isOpen);
  };

  const handleOnSelect = (
    _event: React.MouseEvent<Element, MouseEvent> | undefined,
    value: string | number | undefined,
  ) => {
    if (value && value !== 'no results') {
      setInputValue(value as string);
      setFilterValue('');
      setSelected(value as string);
      onSelect(filteredFieldOptions.find((op) => op.value === value)!.functionDefinition);
    }
    setIsOpen(false);
    setFocusedItemIndex(null);
    setActiveItem(null);
  };

  const onTextInputChange = (_event: React.FormEvent<HTMLInputElement>, value: string) => {
    setInputValue(value);
    setFilterValue(value);
  };

  const handleMenuArrowKeys = (key: string) => {
    let indexToFocus = -1;

    if (isOpen) {
      if (key === 'ArrowUp') {
        // When no index is set or at the first index, focus to the last, otherwise decrement focus index
        if (focusedItemIndex === null || focusedItemIndex === 0) {
          indexToFocus = filteredFieldOptions.length - 1;
        } else {
          indexToFocus = focusedItemIndex - 1;
        }
      }

      if (key === 'ArrowDown') {
        // When no index is set or at the last index, focus to the first, otherwise increment focus index
        if (focusedItemIndex === null || focusedItemIndex === filteredFieldOptions.length - 1) {
          indexToFocus = 0;
        } else {
          indexToFocus = focusedItemIndex + 1;
        }
      }

      setFocusedItemIndex(indexToFocus);
      const focusedItem = filteredFieldOptions.filter((option) => !option.isDisabled)[indexToFocus];
      setActiveItem(`select-typeahead-${focusedItem.value.replace(' ', '-')}`);
    }
  };

  const onInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const enabledMenuItems = filteredFieldOptions.filter((option) => !option.isDisabled);
    const [firstMenuItem] = enabledMenuItems;
    const focusedItem = focusedItemIndex ? enabledMenuItems[focusedItemIndex] : firstMenuItem;

    switch (event.key) {
      // Select the first available option
      case 'Enter':
        if (isOpen && focusedItem.value !== 'no results') {
          setInputValue(String(focusedItem.children));
          setFilterValue('');
          setSelected(String(focusedItem.children));
        }

        setIsOpen((prevIsOpen) => !prevIsOpen);
        setFocusedItemIndex(null);
        setActiveItem(null);

        break;
      case 'Tab':
      case 'Escape':
        setIsOpen(false);
        setActiveItem(null);
        break;
      case 'ArrowUp':
      case 'ArrowDown':
        event.preventDefault();
        handleMenuArrowKeys(event.key);
        break;
    }
  };

  const toggle = (toggleRef: Ref<MenuToggleElement>) => (
    <MenuToggle
      ref={toggleRef}
      variant="typeahead"
      aria-label="Typeahead menu toggle"
      onClick={onToggleClick}
      isExpanded={isOpen}
    >
      <TextInputGroup isPlain>
        <TextInputGroupMain
          value={inputValue}
          onClick={onToggleClick}
          onChange={onTextInputChange}
          onKeyDown={onInputKeyDown}
          id="typeahead-select-input"
          autoComplete="off"
          innerRef={textInputRef}
          placeholder="Select function"
          {...(activeItem && { 'aria-activedescendant': activeItem })}
          role="combobox"
          isExpanded={isOpen}
          aria-controls="select-typeahead-listbox"
        />

        <TextInputGroupUtilities>
          {!!inputValue && (
            <Button
              variant="plain"
              onClick={() => {
                setSelected('');
                setInputValue('');
                setFilterValue('');
                textInputRef?.current?.focus();
              }}
              aria-label="Clear input value"
            >
              <TimesIcon aria-hidden />
            </Button>
          )}
        </TextInputGroupUtilities>
      </TextInputGroup>
    </MenuToggle>
  );

  type FieldOptionsGroupProps = {
    group: string;
    indexes: number[];
  };

  const FieldOptionsGroup: FunctionComponent<FieldOptionsGroupProps> = ({ group, indexes }) => {
    return (
      <>
        <SelectGroup label={group}>
          <SelectList>
            {indexes.map((index) => {
              const option = filteredFieldOptions[index];
              return (
                <SelectOption
                  key={option.value}
                  isFocused={focusedItemIndex === index}
                  className={option.className}
                  onClick={() => setSelected(option.value)}
                  id={`select-typeahead-${option.value}`}
                  value={option.value}
                  ref={null}
                  description={option.description}
                >
                  {option.displayName}
                </SelectOption>
              );
            })}
          </SelectList>
        </SelectGroup>
        <Divider />
      </>
    );
  };

  const groupedOptionIndexes = useMemo(
    () =>
      filteredFieldOptions.reduce(
        (acc, option) => {
          if (!acc[option.functionGroup]) {
            acc[option.functionGroup] = [];
          }
          acc[option.functionGroup].push(filteredFieldOptions.indexOf(option));
          return acc;
        },
        {} as Record<string, number[]>,
      ),
    [filteredFieldOptions],
  );

  const GroupedFieldOptions: FunctionComponent = () => {
    const first = true;
    return Object.keys(groupedOptionIndexes).map((group) => {
      if (groupedOptionIndexes[group].length == 0) return undefined;
      return first ? (
        <FieldOptionsGroup group={group} indexes={groupedOptionIndexes[group]} />
      ) : (
        <>
          <Divider />
          <FieldOptionsGroup group={group} indexes={groupedOptionIndexes[group]} />
        </>
      );
    });
  };

  return (
    <InputGroup>
      <InputGroupItem>
        <Select
          id="typeahead-select"
          isOpen={isOpen}
          selected={selected}
          onSelect={handleOnSelect}
          onOpenChange={() => {
            setIsOpen(false);
          }}
          toggle={toggle}
          isScrollable
          popperProps={{ preventOverflow: true }}
        >
          <GroupedFieldOptions />
        </Select>
      </InputGroupItem>
      <InputGroupItem>
        <Tooltip content={'Add Field'}>
          <Button
            isDisabled={!selected}
            variant="control"
            aria-label="Add Field"
            data-testid={`add-field-button`}
            onClick={() => {}}
          >
            Add
          </Button>
        </Tooltip>
      </InputGroupItem>
    </InputGroup>
  );
};
