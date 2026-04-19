// import React from 'react';
// import {createNativeStackNavigator} from '@react-navigation/native-stack';
// import {useSelector} from 'react-redux';

// import {AuthScreenStack} from '../constants/stacks/authStack/authStack';
// import {OnboardingLayoutWrapper} from '../wrappers/onboardingWrapper';
// import {RootNavigationStackWrapper} from '../wrappers/rootNavigationStackWrapper';

// // 1. Define Param List (all screens = undefined for now)
// export type AuthStackParamList = {
//   onboarding: undefined;
//   enterPhoneNumber: undefined;
//   verifyOTP: undefined;
//   enterPin: undefined;
//   personalInformation: undefined;
//   uploadIdCard: undefined;
//   addProfilePicture: undefined;
//   reviewingInformation: undefined;
//   enterInformation: undefined;
//   VerifyPin: undefined;
// };

// // 2. Create typed stack
// const AuthStack = createNativeStackNavigator<AuthStackParamList>();

// // 3. Define RootState type (temporary safe typing)
// type RootState = {
//   auth: {
//     isOnboard: string;
//   };
// };

// const AuthNavigationStack: React.FC = () => {
//   const state = useSelector((state: RootState) => state.auth);

//   return (
//     <AuthStack.Navigator
//       initialRouteName={
//         state?.isOnboard === 'true' ? 'enterPhoneNumber' : 'onboarding'
//       }
//       screenOptions={{
//         headerShown: false,
//         gestureEnabled: true,
//         animation: 'slide_from_right',
//       }}>
//       <AuthStack.Screen
//         name="onboarding"
//         component={OnboardingLayoutWrapper(
//           AuthScreenStack.nestedScreens.onboarding.component,
//         )}
//       />

//       <AuthStack.Screen
//         name="enterPhoneNumber"
//         component={RootNavigationStackWrapper(
//           AuthScreenStack.nestedScreens.enterPhoneNumber.component,
//         )}
//       />

//       <AuthStack.Screen
//         name="verifyOTP"
//         component={RootNavigationStackWrapper(
//           AuthScreenStack.nestedScreens.verifyOTP.component,
//         )}
//       />

//       <AuthStack.Screen
//         name="enterPin"
//         component={RootNavigationStackWrapper(
//           AuthScreenStack.nestedScreens.enterPin.component,
//         )}
//       />

//       <AuthStack.Screen
//         name="personalInformation"
//         component={RootNavigationStackWrapper(
//           AuthScreenStack.nestedScreens.personalInformation.component,
//         )}
//       />

//       <AuthStack.Screen
//         name="uploadIdCard"
//         component={RootNavigationStackWrapper(
//           AuthScreenStack.nestedScreens.uploadIdCard.component,
//         )}
//       />

//       <AuthStack.Screen
//         name="addProfilePicture"
//         component={RootNavigationStackWrapper(
//           AuthScreenStack.nestedScreens.addProfilePicture.component,
//         )}
//       />

//       <AuthStack.Screen
//         name="reviewingInformation"
//         component={RootNavigationStackWrapper(
//           AuthScreenStack.nestedScreens.reviewingInformation.component,
//         )}
//       />

//       <AuthStack.Screen
//         name="enterInformation"
//         component={RootNavigationStackWrapper(
//           AuthScreenStack.nestedScreens.enterInformation.component,
//         )}
//       />

//       <AuthStack.Screen
//         name="VerifyPin"
//         component={RootNavigationStackWrapper(
//           AuthScreenStack.nestedScreens.VerifyPin.component,
//         )}
//       />
//     </AuthStack.Navigator>
//   );
// };

// export default AuthNavigationStack;
