export const AuthStack = {
  name: 'AuthStack',
  nestedScreens: {
    Onboarding: {
      name: 'Onboarding' as const,
    },
    Signup: {
      name: 'Signup' as const,
    },
    VerifyOTP: {
      name: 'VerifyOTP' as const,
    },
  },
};
