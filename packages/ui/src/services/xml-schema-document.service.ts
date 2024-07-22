import {
  XmlSchema,
  XmlSchemaAll,
  XmlSchemaAllMember,
  XmlSchemaAny,
  XmlSchemaAttribute,
  XmlSchemaAttributeGroup,
  XmlSchemaAttributeGroupMember,
  XmlSchemaAttributeGroupRef,
  XmlSchemaAttributeOrGroupRef,
  XmlSchemaChoice,
  XmlSchemaChoiceMember,
  XmlSchemaCollection,
  XmlSchemaComplexType,
  XmlSchemaElement,
  XmlSchemaGroup,
  XmlSchemaGroupParticle,
  XmlSchemaGroupRef,
  XmlSchemaObjectBase,
  XmlSchemaParticle,
  XmlSchemaRef,
  XmlSchemaSequence,
  XmlSchemaSequenceMember,
  XmlSchemaSimpleType,
  XmlSchemaUse,
} from '@datamapper-poc/xml-schema-ts';
import { BaseDocument, BaseField } from '../models/document';
import { Types } from '../models/types';
import { DocumentType } from '../models/path';

export class XmlSchemaDocument extends BaseDocument {
  rootElement: XmlSchemaElement;
  fields: XmlSchemaField[] = [];

  constructor(
    public xmlSchema: XmlSchema,
    documentType: DocumentType,
    documentId: string,
  ) {
    super(documentType, documentId);
    this.name = documentId;
    if (this.xmlSchema.getElements().size == 0) {
      throw Error("There's no top level Element in the schema");
    }
    // TODO let user choose the root element from top level elements if there're multiple
    this.rootElement = XmlSchemaDocumentService.getFirstElement(this.xmlSchema);
    XmlSchemaDocumentService.populateElement(this, this.fields, this.rootElement);
    this.schemaType = 'XML';
  }
}

type XmlSchemaParentType = XmlSchemaDocument | XmlSchemaField;

export class XmlSchemaField extends BaseField {
  fields: XmlSchemaField[] = [];
  namespaceURI: string | null = null;
  namespacePrefix: string | null = null;

  constructor(
    public parent: XmlSchemaParentType,
    public name: string,
    public isAttribute: boolean,
  ) {
    super(parent, parent instanceof XmlSchemaDocument ? parent : (parent as XmlSchemaField).ownerDocument, name);
  }
}

export class XmlSchemaDocumentService {
  static parseXmlSchema(content: string): XmlSchema {
    const collection = new XmlSchemaCollection();
    return collection.read(content, () => {});
  }

  static createXmlSchemaDocument(documentType: DocumentType, documentId: string, content: string) {
    const schema = XmlSchemaDocumentService.parseXmlSchema(content);
    return new XmlSchemaDocument(schema, documentType, documentId);
  }

  static getFirstElement(xmlSchema: XmlSchema) {
    return xmlSchema.getElements().values().next().value;
  }

  /**
   * @deprecated
   */
  static throwNotYetSupported(object: XmlSchemaObjectBase) {
    /* eslint-disable  @typescript-eslint/no-explicit-any */
    const cache: any[] = [];
    throw Error(
      `Not yet supported: ${JSON.stringify(object, (_key, value) => {
        if (typeof value === 'object' && value !== null) {
          if (cache.includes(value)) return;
          cache.push(value);
        }
        if (typeof value === 'bigint') return value.toString();
      })}`,
    );
  }

  /**
   * Populate XML Element as a field into {@link fields} array passed in as an argument.
   * @param parent
   * @param fields
   * @param element
   */
  static populateElement(parent: XmlSchemaParentType, fields: XmlSchemaField[], element: XmlSchemaElement) {
    const name = element.getWireName()!.getLocalPart()!;
    const field: XmlSchemaField = new XmlSchemaField(parent, name, false);
    field.namespaceURI = element.getWireName()!.getNamespaceURI();
    field.namespacePrefix = element.getWireName()!.getPrefix();
    field.defaultValue = element.defaultValue || element.fixedValue;
    field.minOccurs = element.getMinOccurs();
    field.maxOccurs = element.getMaxOccurs();
    fields.push(field);

    const schemaType = element.getSchemaType();
    if (schemaType == null) {
      const typeName = element.getSchemaTypeName()?.getLocalPart();
      field.type = (typeName && Types[typeName as keyof typeof Types]) || Types.AnyType;
      return;
    }
    field.type = Types.Container;
    if (schemaType instanceof XmlSchemaSimpleType) {
      XmlSchemaDocumentService.throwNotYetSupported(element);
    } else if (schemaType instanceof XmlSchemaComplexType) {
      const complex = schemaType as XmlSchemaComplexType;
      const attributes: XmlSchemaAttributeOrGroupRef[] = complex.getAttributes();
      attributes.forEach((attr) => {
        XmlSchemaDocumentService.populateAttributeOrGroupRef(field, field.fields, attr);
      });
      XmlSchemaDocumentService.populateParticle(field, field.fields, complex.getParticle());
    } else {
      XmlSchemaDocumentService.throwNotYetSupported(element);
    }
  }

  static populateAttributeOrGroupRef(
    parent: XmlSchemaParentType,
    fields: XmlSchemaField[],
    attr: XmlSchemaAttributeOrGroupRef,
  ) {
    if (attr instanceof XmlSchemaAttribute) {
      XmlSchemaDocumentService.populateAttribute(parent, fields, attr);
    } else if (attr instanceof XmlSchemaAttributeGroupRef) {
      XmlSchemaDocumentService.populateAttributeGroupRef(parent, fields, attr);
    } else {
      XmlSchemaDocumentService.throwNotYetSupported(attr);
    }
  }

  /**
   * Populate XML Attribute as a field into {@link fields} array passed in as an argument.
   * @param parent
   * @param fields
   * @param attr
   */
  static populateAttribute(parent: XmlSchemaParentType, fields: XmlSchemaField[], attr: XmlSchemaAttribute) {
    const name = attr.getWireName()!.getLocalPart()!;
    const field = new XmlSchemaField(parent, name, true);
    field.namespaceURI = attr.getWireName()!.getNamespaceURI();
    field.namespacePrefix = attr.getWireName()!.getPrefix();
    field.defaultValue = attr.getDefaultValue() || attr.getFixedValue();
    fields.push(field);

    const use = attr.getUse();
    switch (use) {
      case XmlSchemaUse.PROHIBITED:
        field.maxOccurs = 0;
        field.minOccurs = 0;
        break;
      case XmlSchemaUse.REQUIRED:
        field.minOccurs = 1;
        field.maxOccurs = 1;
        break;
      default: // OPTIONAL, NONE or not specified
        field.minOccurs = 0;
        field.maxOccurs = 1;
        break;
    }
  }

  static populateAttributeGroupRef(
    parent: XmlSchemaParentType,
    fields: XmlSchemaField[],
    groupRef: XmlSchemaAttributeGroupRef,
  ) {
    const ref: XmlSchemaRef<XmlSchemaAttributeGroup> = groupRef.getRef();
    XmlSchemaDocumentService.populateAttributeGroup(parent, fields, ref.getTarget());
  }

  static populateAttributeGroupMember(
    parent: XmlSchemaParentType,
    fields: XmlSchemaField[],
    member: XmlSchemaAttributeGroupMember,
  ) {
    if (member instanceof XmlSchemaAttribute) {
      XmlSchemaDocumentService.populateAttribute(parent, fields, member);
    } else if (member instanceof XmlSchemaAttributeGroup) {
      XmlSchemaDocumentService.populateAttributeGroup(parent, fields, member);
    } else if (member instanceof XmlSchemaAttributeGroupRef) {
      XmlSchemaDocumentService.populateAttributeGroupRef(parent, fields, member);
    } else {
      XmlSchemaDocumentService.throwNotYetSupported(member);
    }
  }

  static populateAttributeGroup(
    parent: XmlSchemaParentType,
    fields: XmlSchemaField[],
    group: XmlSchemaAttributeGroup | null,
  ) {
    if (group == null) {
      return;
    }
    group
      .getAttributes()
      .forEach((member: XmlSchemaAttributeGroupMember) =>
        XmlSchemaDocumentService.populateAttributeGroupMember(parent, fields, member),
      );
  }

  static populateParticle(parent: XmlSchemaParentType, fields: XmlSchemaField[], particle: XmlSchemaParticle | null) {
    if (particle == null) {
      return;
    }
    if (particle instanceof XmlSchemaAny) {
      XmlSchemaDocumentService.populateAny(fields, particle);
    } else if (particle instanceof XmlSchemaElement) {
      XmlSchemaDocumentService.populateElement(parent, fields, particle);
    } else if (particle instanceof XmlSchemaGroupParticle) {
      XmlSchemaDocumentService.populateGroupParticle(parent, fields, particle);
    } else if (particle instanceof XmlSchemaGroupRef) {
      XmlSchemaDocumentService.populateGroupRef(fields, particle);
    } else {
      XmlSchemaDocumentService.throwNotYetSupported(particle);
    }
  }

  static populateAny(_fields: XmlSchemaField[], schemaAny: XmlSchemaAny) {
    /* TODO - xs:any allows arbitrary elements */
    XmlSchemaDocumentService.throwNotYetSupported(schemaAny);
  }

  static populateGroupParticle(
    parent: XmlSchemaParentType,
    fields: XmlSchemaField[],
    groupParticle: XmlSchemaGroupParticle | null,
  ) {
    if (groupParticle == null) {
      return;
    }
    if (groupParticle instanceof XmlSchemaChoice) {
      const choice = groupParticle as XmlSchemaChoice;
      choice
        .getItems()
        .forEach((member: XmlSchemaChoiceMember) =>
          XmlSchemaDocumentService.populateChoiceMember(parent, fields, member),
        );
    } else if (groupParticle instanceof XmlSchemaSequence) {
      const sequence = groupParticle as XmlSchemaSequence;
      sequence
        .getItems()
        .forEach((member: XmlSchemaSequenceMember) =>
          XmlSchemaDocumentService.populateSequenceMember(parent, fields, member),
        );
    } else if (groupParticle instanceof XmlSchemaAll) {
      const all = groupParticle as XmlSchemaAll;
      all
        .getItems()
        .forEach((member: XmlSchemaAllMember) => XmlSchemaDocumentService.populateAllMember(parent, fields, member));
    } else {
      XmlSchemaDocumentService.throwNotYetSupported(groupParticle);
    }
  }

  static populateGroupRef(_fields: XmlSchemaField[], groupRef: XmlSchemaGroupRef) {
    XmlSchemaDocumentService.throwNotYetSupported(groupRef);
  }

  static populateChoiceMember(parent: XmlSchemaParentType, fields: XmlSchemaField[], member: XmlSchemaChoiceMember) {
    if (member instanceof XmlSchemaParticle) {
      XmlSchemaDocumentService.populateParticle(parent, fields, member);
    } else if (member instanceof XmlSchemaGroup) {
      XmlSchemaDocumentService.populateGroup(parent, fields, member);
    } else {
      XmlSchemaDocumentService.throwNotYetSupported(member);
    }
  }

  static populateSequenceMember(
    parent: XmlSchemaParentType,
    fields: XmlSchemaField[],
    member: XmlSchemaSequenceMember,
  ) {
    if (member instanceof XmlSchemaParticle) {
      XmlSchemaDocumentService.populateParticle(parent, fields, member);
    } else if (member instanceof XmlSchemaGroup) {
      XmlSchemaDocumentService.populateGroup(parent, fields, member);
    } else {
      XmlSchemaDocumentService.throwNotYetSupported(member);
    }
  }

  static populateAllMember(parent: XmlSchemaParentType, fields: XmlSchemaField[], member: XmlSchemaAllMember) {
    if (member instanceof XmlSchemaParticle) {
      XmlSchemaDocumentService.populateParticle(parent, fields, member);
    } else if (member instanceof XmlSchemaGroup) {
      XmlSchemaDocumentService.populateGroup(parent, fields, member);
    } else {
      XmlSchemaDocumentService.throwNotYetSupported(member);
    }
  }

  static populateGroup(parent: XmlSchemaParentType, fields: XmlSchemaField[], group: XmlSchemaGroup) {
    XmlSchemaDocumentService.populateParticle(parent, fields, group.getParticle());
  }
}
