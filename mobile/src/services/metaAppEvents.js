import { AppEventsLogger, Settings } from 'react-native-fbsdk-next';

let isInitialized = false;

function runIfInitialized(callback) {
  if (!isInitialized) {
    return false;
  }

  try {
    callback();
    return true;
  } catch (error) {
    if (__DEV__) {
      console.warn('Unable to log Meta App Event:', error);
    }
    return false;
  }
}

export function initializeMetaAppEvents() {
  if (isInitialized) {
    return true;
  }

  try {
    Settings.initializeSDK();
    isInitialized = true;
    return true;
  } catch (error) {
    if (__DEV__) {
      console.warn(
        'Unable to initialize Meta App Events. Use a native development build instead of Expo Go.',
        error,
      );
    }
    return false;
  }
}

export function logRegistration(method = 'unknown') {
  return runIfInitialized(() => {
    AppEventsLogger.logEvent(AppEventsLogger.AppEvents.CompletedRegistration, {
      [AppEventsLogger.AppEventParams.RegistrationMethod]: method,
    });
  });
}

export function logLogin(method = 'unknown') {
  return runIfInitialized(() => {
    AppEventsLogger.logEvent('Login', { login_method: method });
  });
}

export function logSubscription({ amount, currency = 'USD', plan } = {}) {
  if (!Number.isFinite(amount) || amount < 0) {
    if (__DEV__) {
      console.warn('Meta subscription events require a non-negative numeric amount.');
    }
    return false;
  }

  return runIfInitialized(() => {
    const parameters = {
      [AppEventsLogger.AppEventParams.Currency]: currency,
    };

    if (plan) {
      parameters.subscription_plan = plan;
    }

    AppEventsLogger.logEvent(
      AppEventsLogger.AppEvents.Subscribe,
      amount,
      parameters,
    );
  });
}

export function flushMetaAppEvents() {
  return runIfInitialized(() => {
    AppEventsLogger.flush();
  });
}
