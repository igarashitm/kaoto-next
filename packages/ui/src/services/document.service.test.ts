import { DocumentService } from './document.service';
import { XmlSchemaDocumentService } from './xml-schema-document.service';
import { DocumentType } from '../models';
import * as fs from 'fs';

describe('DocumentService', () => {
  const orderXsd = fs.readFileSync(__dirname + '/../../../../test-resources/ShipOrder.xsd').toString();
  const sourceDoc = XmlSchemaDocumentService.createXmlSchemaDocument(
    DocumentType.SOURCE_BODY,
    'ShipOrder.xsd',
    orderXsd,
  );
  const targetDoc = XmlSchemaDocumentService.createXmlSchemaDocument(
    DocumentType.TARGET_BODY,
    'ShipOrder.xsd',
    orderXsd,
  );

  describe('getFieldStack()', () => {
    it('', () => {
      const stack = DocumentService.getFieldStack(sourceDoc.fields[0].fields[1]);
      expect(stack.length).toEqual(1);
      expect(stack[0].name).toEqual('ShipOrder');
      const stackWithSelf = DocumentService.getFieldStack(sourceDoc.fields[0].fields[1], true);
      expect(stackWithSelf.length).toEqual(2);
      expect(stackWithSelf[0].name).toEqual('OrderPerson');
    });
  });

  describe('hasField()', () => {
    it('', () => {
      expect(DocumentService.hasField(sourceDoc, sourceDoc.fields[0].fields[0])).toBeTruthy();
      expect(DocumentService.hasField(sourceDoc, targetDoc.fields[0].fields[0])).toBeFalsy();
    });
  });

  describe('getFieldFromPathExpression()', () => {
    it('', () => {
      const pathExpression = '/' + sourceDoc.fields[0].fields[2].fieldIdentifier.pathSegments.join('/');
      const field = DocumentService.getFieldFromPathExpression(sourceDoc, pathExpression);
      expect(field?.name).toEqual('ShipTo');
    });
  });

  describe('getFieldFromPathSegments()', () => {
    it('', () => {
      const pathSegments = sourceDoc.fields[0].fields[2].fieldIdentifier.pathSegments;
      const field = DocumentService.getFieldFromPathSegments(sourceDoc, pathSegments);
      expect(field?.name).toEqual('ShipTo');
    });
  });
});
