// Utility functions for handling user metadata

/**
 * Fixes malformed metadata that was incorrectly stored as character-by-character key-value pairs
 * This happens when a JSON string gets converted into an object with numeric keys for each character
 */
export const fixMalformedMetadata = (metadata: Record<string, unknown> | undefined): Record<string, unknown> => {
  if (!metadata || typeof metadata !== 'object') {
    return {};
  }

  const keys = Object.keys(metadata);
  
  // Check if all keys are numeric (indicating character-by-character storage)
  if (keys.length > 0 && keys.every(key => !isNaN(Number(key)))) {
    try {
      // Reconstruct the original JSON string from character keys
      const reconstructedString = keys
        .sort((a, b) => Number(a) - Number(b))
        .map(key => (metadata as any)[key])
        .join('');
      
      // Parse the reconstructed string back to proper object
      const parsedMetadata = JSON.parse(reconstructedString);
      console.log('🔧 Fixed malformed metadata:', parsedMetadata);
      return parsedMetadata;
    } catch (error) {
      console.warn('⚠️ Could not parse malformed metadata, using defaults:', error);
      return {};
    }
  }

  // If metadata is already in correct format, return as is
  return metadata;
};

/**
 * Safely updates user metadata with new values
 */
export const updateMetadata = (
  currentMetadata: Record<string, unknown> | undefined,
  updates: Record<string, unknown>
): Record<string, unknown> => {
  const fixedMetadata = fixMalformedMetadata(currentMetadata);
  
  return {
    ...fixedMetadata,
    ...updates,
  };
};

/**
 * Gets a specific value from metadata, handling malformed metadata
 */
export const getMetadataValue = (
  metadata: Record<string, unknown> | undefined,
  key: string,
  defaultValue?: unknown
): unknown => {
  const fixedMetadata = fixMalformedMetadata(metadata);
  return fixedMetadata[key] ?? defaultValue;
};