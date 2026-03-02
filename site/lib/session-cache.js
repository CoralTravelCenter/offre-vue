function canUseSessionStorage() {
    try {
        return typeof sessionStorage !== 'undefined';
    } catch (error) {
        return false;
    }
}

export function removeCache(key) {
    if (!canUseSessionStorage()) {
        return;
    }
    sessionStorage.removeItem(key);
}

export function getCache(key) {
    if (!canUseSessionStorage()) {
        return null;
    }
    const cachedValue = sessionStorage.getItem(key);
    if (!cachedValue) {
        return null;
    }
    try {
        return JSON.parse(cachedValue);
    } catch (error) {
        removeCache(key);
        return null;
    }
}

export function setCache(key, value) {
    if (!canUseSessionStorage()) {
        return;
    }
    try {
        sessionStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
    }
}
