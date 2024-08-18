import {
  BreadthFirstLayout,
  ColaLayout,
  ConcentricLayout,
  DagreGroupsLayout,
  DefaultEdge,
  ForceLayout,
  GridLayout,
  ModelKind,
  Visualization,
} from '@patternfly/react-topology';
import { CustomGroupWithSelection } from '../Custom';
import { CanvasDefaults } from './canvas.defaults';
import { LayoutType } from './canvas.models';
import { ControllerService } from './controller.service';

describe('ControllerService', () => {
  it('should allow consumers to create a new controller and register its factories', () => {
    const layoutFactorySpy = jest.spyOn(Visualization.prototype, 'registerLayoutFactory');
    const componentFactorySpy = jest.spyOn(Visualization.prototype, 'registerComponentFactory');
    const baselineElementFactorySpy = jest.spyOn(Visualization.prototype, 'registerElementFactory');

    const controller = ControllerService.createController();

    expect(controller).toBeInstanceOf(Visualization);
    expect(layoutFactorySpy).toHaveBeenCalledWith(ControllerService.baselineLayoutFactory);
    expect(componentFactorySpy).toHaveBeenCalledWith(ControllerService.baselineComponentFactory);
    expect(baselineElementFactorySpy).toHaveBeenCalledWith(ControllerService.baselineElementFactory);
  });

  describe('baselineComponentFactory', () => {
    it('should return the correct component for a group', () => {
      const component = ControllerService.baselineComponentFactory({} as ModelKind, 'group');

      expect(component).toBe(CustomGroupWithSelection);
    });

    it('should return the correct component for a graph', () => {
      const component = ControllerService.baselineComponentFactory(ModelKind.graph, 'graph');

      expect(component).toBeDefined();
    });

    it('should return the correct component for a node', () => {
      const component = ControllerService.baselineComponentFactory(ModelKind.node, 'node');

      expect(component).toBeDefined();
    });

    it('should return the correct component for an edge', () => {
      const component = ControllerService.baselineComponentFactory(ModelKind.edge, 'edge');

      expect(component).toBe(DefaultEdge);
    });

    it('should return undefined for an unknown type', () => {
      const component = ControllerService.baselineComponentFactory({} as ModelKind, 'unknown');

      expect(component).toBeUndefined();
    });
  });

  it.each([
    [LayoutType.BreadthFirst, BreadthFirstLayout],
    [LayoutType.Cola, ColaLayout],
    [LayoutType.ColaNoForce, ColaLayout],
    [LayoutType.ColaGroups, ColaLayout],
    [LayoutType.Concentric, ConcentricLayout],
    [LayoutType.DagreVertical, DagreGroupsLayout],
    [LayoutType.DagreHorizontal, DagreGroupsLayout],
    [LayoutType.Force, ForceLayout],
    [LayoutType.Grid, GridLayout],
    ['unknown' as LayoutType, ColaLayout],
  ] as const)('baselineLayoutFactory [%s]', (type, layout) => {
    const newController = ControllerService.createController();
    newController.fromModel(
      {
        nodes: [],
        edges: [],
        graph: {
          id: 'g1',
          type: 'graph',
          layout: CanvasDefaults.DEFAULT_LAYOUT,
        },
      },
      false,
    );
    const layoutFactory = ControllerService.baselineLayoutFactory(type, newController.getGraph());

    expect(layoutFactory).toBeInstanceOf(layout);
  });
});