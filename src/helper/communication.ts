export const ConfigurationTypeCommunicationLocal = "local";
export const ConfigurationTypeCommunicationExternalApi = "external-api";
export const ConfigurationTypeCommunicationBinaryFile = "binary-file";
export const ConfigurationTypeCommunicationDefault: string = ConfigurationTypeCommunicationLocal;

export const ConfigurationTypeCommunication: { key: string; title: string }[] = [
  {
    key: ConfigurationTypeCommunicationLocal,
    title: "Local communication",
  },
  {
    key: ConfigurationTypeCommunicationExternalApi,
    title: "External endpoint api communication",
  },
  {
    key: ConfigurationTypeCommunicationBinaryFile,
    title: "Local binnary file communication",
  },
];
