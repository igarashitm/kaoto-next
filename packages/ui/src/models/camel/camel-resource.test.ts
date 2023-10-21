import { createCamelResource } from './camel-resource';
import { SourceSchemaType } from './source-schema-type';
import { camelRouteJson } from '../../stubs/camel-route';
import { integrationJson } from '../../stubs/integration';
import { pipeJson } from '../../stubs/pipe';
import { CamelRouteVisualEntity, PipeVisualEntity } from '../visualization/flows';
import { kameletBindingJson } from '../../stubs/kamelet-binding-route';
import { kameletJson } from '../../stubs/kamelet';

describe('createCamelResource', () => {
  it('should create an empty CamelRouteResource if no args is specified', () => {
    const resource = createCamelResource();
    expect(resource.getType()).toEqual(SourceSchemaType.Route);
    expect(resource.getEntities()).toEqual([]);
    expect(resource.getVisualEntities()).toEqual([]);
  });

  it('should create an empty CamelRouteResource if no args is specified', () => {
    const resource = createCamelResource(undefined, SourceSchemaType.Route);
    expect(resource.getType()).toEqual(SourceSchemaType.Route);
    expect(resource.getEntities()).toEqual([]);
    expect(resource.getVisualEntities()).toEqual([]);
  });

  it('should create an empty IntegrationResource if no args is specified', () => {
    const resource = createCamelResource(undefined, SourceSchemaType.Integration);
    expect(resource.getType()).toEqual(SourceSchemaType.Integration);
    expect(resource.getEntities()).toEqual([]);
    expect(resource.getVisualEntities()).toEqual([]);
  });

  it('should create an empty CamelRouteResource if no args is specified', () => {
    const resource = createCamelResource(undefined, SourceSchemaType.Kamelet);
    expect(resource.getType()).toEqual(SourceSchemaType.Kamelet);
    expect(resource.getEntities()).toEqual([]);
    expect(resource.getVisualEntities()).toEqual([]);
  });

  it('should create an empty CameletBindingResource if no args is specified', () => {
    const resource = createCamelResource(undefined, SourceSchemaType.KameletBinding);
    expect(resource.getType()).toEqual(SourceSchemaType.KameletBinding);
    expect(resource.getEntities()).toEqual([]);
    expect(resource.getVisualEntities().length).toEqual(1);
  });

  it('should create an empty PipeResource if no args is specified', () => {
    const resource = createCamelResource(undefined, SourceSchemaType.Pipe);
    expect(resource.getType()).toEqual(SourceSchemaType.Pipe);
    expect(resource.getEntities()).toEqual([]);
    expect(resource.getVisualEntities().length).toEqual(1);
    const vis = resource.getVisualEntities()[0] as PipeVisualEntity;
    expect(vis.spec?.source).toBeUndefined();
    expect(vis.spec?.steps).toBeUndefined();
    expect(vis.spec?.sink).toBeUndefined();
  });

  it('should create a camel route', () => {
    const resource = createCamelResource(camelRouteJson);
    expect(resource.getType()).toEqual(SourceSchemaType.Route);
    expect(resource.getVisualEntities().length).toEqual(1);
    const vis = resource.getVisualEntities()[0] as CamelRouteVisualEntity;
    expect(vis.route.from?.uri).toBeDefined();
  });

  // TODO
  it.skip('should create an Integration', () => {
    const resource = createCamelResource(integrationJson);
    expect(resource.getType()).toEqual(SourceSchemaType.Integration);
    expect(resource.getVisualEntities().length).toEqual(2);
  });

  // TODO
  it.skip('should create a Kamelet', () => {
    const resource = createCamelResource(kameletJson);
    expect(resource.getType()).toEqual(SourceSchemaType.Kamelet);
    expect(resource.getVisualEntities().length).toEqual(1);
  });

  it('should create a KameletBindingPipe', () => {
    const resource = createCamelResource(kameletBindingJson);
    expect(resource.getType()).toEqual(SourceSchemaType.KameletBinding);
    expect(resource.getVisualEntities().length).toEqual(1);
    const vis = resource.getVisualEntities()[0] as PipeVisualEntity;
    expect(vis.spec?.source?.ref?.name).toEqual('webhook-source');
  });

  it('should create a Pipe', () => {
    const resource = createCamelResource(pipeJson);
    expect(resource.getType()).toEqual(SourceSchemaType.Pipe);
    expect(resource.getVisualEntities().length).toEqual(1);
    const vis = resource.getVisualEntities()[0] as PipeVisualEntity;
    expect(vis.spec?.source?.ref?.name).toEqual('webhook-source');
  });
});