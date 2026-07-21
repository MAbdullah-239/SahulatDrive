export const AuthStack = {
  name: 'AuthStack',
  nestedScreens: {
    Onboarding: {
      name: 'Onboarding' as const,
    },
    Signup: {
      name: 'Signup' as const,
    },
    Login: {
      name: 'Login' as const,
    },
    VerifyOTP: {
      name: 'VerifyOTP' as const,
    },
    ForgotPassword: {
      name: 'ForgotPassword' as const,
    },
    ResetPassword: {
      name: 'ResetPassword' as const,
    },
    ProviderSelectServices: {
      name: 'ProviderSelectServices' as const,
    },
    ProviderUploadDocuments: {
      name: 'ProviderUploadDocuments' as const,
    },
    ProviderAddTowTruck: {
      name: 'ProviderAddTowTruck' as const,
    },
    ProviderAddWorkshop: {
      name: 'ProviderAddWorkshop' as const,
    },
    ProviderPendingApproval: {
      name: 'ProviderPendingApproval' as const,
    },
  },
};
