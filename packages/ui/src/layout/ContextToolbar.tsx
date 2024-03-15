/*
    Copyright (C) 2017 Red Hat, Inc.

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

            http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
*/
import { FunctionComponent } from 'react';
import { Toolbar, ToolbarContent, ToolbarGroup } from '@patternfly/react-core';
import { MainMenuToolbarItem } from '../components/toolbar';
import { ToggleDebugToolbarItem } from '../components/toolbar/ToggleDebugToolbarItem';

export const ContextToolbar: FunctionComponent = () => {
  return (
    <Toolbar id="data-toolbar" role={'complementary'}>
      <ToolbarContent>
        {
          <ToolbarGroup variant="button-group" spacer={{ default: 'spacerMd' }}>
            <MainMenuToolbarItem />
            <ToggleDebugToolbarItem />
          </ToolbarGroup>
        }
      </ToolbarContent>
    </Toolbar>
  );
};
