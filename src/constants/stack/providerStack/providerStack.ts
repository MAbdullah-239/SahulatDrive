export const ProviderStack = {
  name: 'ProviderStack' as const,
  nestedScreens: {
    ProviderTabs: {name: 'ProviderTabs' as const},
    ProviderSelectServices: {name: 'ProviderSelectServices' as const},
    ProviderUploadDocuments: {name: 'ProviderUploadDocuments' as const},
    ProviderAddTowTruck: {name: 'ProviderAddTowTruck' as const},
    ProviderPendingApproval: {name: 'ProviderPendingApproval' as const},
    ProviderIncomingJob: {name: 'ProviderIncomingJob' as const},
    ProviderActiveJob: {name: 'ProviderActiveJob' as const},
  },
};
