// Figma Variables API type definitions
// These extend the existing Figma API types

interface Variable {
  id: string;
  name: string;
  description: string;
  variableCollectionId: string;
  resolvedType: 'BOOLEAN' | 'COLOR' | 'FLOAT' | 'STRING';
  valuesByMode: { [modeId: string]: any };
  scopes: string[];
  remove(): void;
  setValueForMode(modeId: string, value: any): void;
}

interface VariableCollection {
  id: string;
  name: string;
  modes: Array<{ modeId: string; name: string }>;
  defaultModeId: string;
  addMode(name: string): string;
  renameMode(modeId: string, name: string): void;
}

interface VariablesAPI {
  getLocalVariableCollectionsAsync(): Promise<VariableCollection[]>;
  getVariableCollectionByIdAsync(id: string): Promise<VariableCollection | null>;
  getLocalVariablesAsync(resolvedType?: 'BOOLEAN' | 'COLOR' | 'FLOAT' | 'STRING'): Promise<Variable[]>;
  getVariableByIdAsync(id: string): Promise<Variable | null>;
  createVariableCollection(name: string): VariableCollection;
  createVariable(name: string, collection: VariableCollection | string, resolvedType: 'BOOLEAN' | 'COLOR' | 'FLOAT' | 'STRING'): Variable;
  createVariableAlias(variable: Variable): any;
  createVariableAliasByIdAsync(variableId: string): Promise<any>;
  setBoundVariableForPaint(paint: any, field: string, variable: Variable): any;
  setBoundVariableForEffect(effect: any, field: string, variable: Variable): any;
  setBoundVariableForLayoutGrid(layoutGrid: any, field: string, variable: Variable): any;
  importVariableByKeyAsync(key: string): Promise<Variable>;
}

// Augment the existing global figma object
declare global {
  interface PluginAPI {
    variables: VariablesAPI;
  }
}