import { FunctionComponent, PropsWithChildren, createContext } from 'react';

export interface IFilePreferencesApi {
  /**
   * Get metadata querying a Kaoto metadata file.
   * @param key The key to retrieve the metadata from the Kaoto metadata file
   */
  getMetadata<T>(key: string): Promise<T | undefined>;

  /**
   * Save metadata to a Kaoto metadata file.
   * @param key The key to set the metadata
   * @param metadata The metadata to be saved
   */
  setMetadata<T>(key: string, metadata: T): Promise<void>;
}

export const MetadataContext = createContext<IFilePreferencesApi | undefined>(undefined);

/**
 * The goal for this provider is to expose a settings adapter to the SettingsForm component
 * and its children, so they can be used to render the form fields.
 * In addition to that, it also provides a mechanism to read/write the settings values.
 */
export const MetadataProvider: FunctionComponent<PropsWithChildren<{ api: IFilePreferencesApi }>> = ({
  api,
  children,
}) => {
  return <MetadataContext.Provider value={api}>{children}</MetadataContext.Provider>;
};
