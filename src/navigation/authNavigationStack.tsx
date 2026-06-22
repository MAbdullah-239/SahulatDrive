// import React from 'react';
// import {createNativeStackNavigator} from '@react-navigation/native-stack';
// import {useSelector} from 'react-redux';

// import {AuthScreenStack} from '../constants/stacks/authStack/authStack';

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
//     </AuthStack.Navigator>
//   );
// };

// export default AuthNavigationStack;
