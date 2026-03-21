import vkBridge from '@vkontakte/vk-bridge';

const bridge = vkBridge.default || vkBridge;

export { bridge };

export async function getUserInfo() {
  try {
    return await bridge.send('VKWebAppGetUserInfo');
  } catch (error) {
    console.warn('VKWebAppGetUserInfo failed:', error);
    return { first_name: 'Dev', last_name: 'User', photo_200: '' };
  }
}

export async function getPhoneNumber() {
  try {
    const result = await bridge.send('VKWebAppGetPhoneNumber');
    return result.phone_number;
  } catch (error) {
    console.warn('VKWebAppGetPhoneNumber failed:', error);
    return null;
  }
}

export async function getEmail() {
  try {
    const result = await bridge.send('VKWebAppGetEmail');
    return result.email;
  } catch (error) {
    console.warn('VKWebAppGetEmail failed:', error);
    return null;
  }
}

export async function share(link) {
  try {
    return await bridge.send('VKWebAppShare', { link });
  } catch (error) {
    console.warn('VKWebAppShare failed:', error);
    return null;
  }
}

export async function allowNotifications() {
  try {
    const result = await bridge.send('VKWebAppAllowNotifications');
    return result.result === true;
  } catch (error) {
    console.warn('VKWebAppAllowNotifications failed:', error);
    return false;
  }
}

export async function denyNotifications() {
  try {
    const result = await bridge.send('VKWebAppDenyNotifications');
    return result.result === true;
  } catch (error) {
    console.warn('VKWebAppDenyNotifications failed:', error);
    return false;
  }
}

export async function addToFavorites() {
  try {
    const result = await bridge.send('VKWebAppAddToFavorites');
    return result.result === true;
  } catch (error) {
    console.warn('VKWebAppAddToFavorites failed:', error);
    return false;
  }
}
