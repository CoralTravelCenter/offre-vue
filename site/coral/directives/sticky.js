import {unref} from "vue";

const STICKY_STATE_KEY = "__offreStickyState";
const STICKY_EVENT_NAME = "stick";
const STICKY_EPSILON = 0.5;

function getRawValue(value) {
  return unref(value);
}

function normalizeLength(value, fallback) {
  const raw = getRawValue(value);
  if (raw === null || raw === undefined || raw === "") {
    if (fallback === null || fallback === undefined) {
      return "";
    }
    return `${fallback}px`;
  }
  if (typeof raw === "number") {
    return `${raw}px`;
  }
  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (!trimmed) {
      return "";
    }
    return /^-?\d+(\.\d+)?$/.test(trimmed) ? `${trimmed}px` : trimmed;
  }
  return "";
}

function normalizeOffsetNumber(value, fallback) {
  const raw = getRawValue(value);
  if (raw === null || raw === undefined || raw === "") {
    return fallback;
  }
  if (typeof raw === "number") {
    return Number.isFinite(raw) ? raw : fallback;
  }
  if (typeof raw === "string") {
    const parsed = Number.parseFloat(raw);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
}

function normalizeConfig(rawConfig) {
  const raw = getRawValue(rawConfig);
  if (raw === false) {
    return {enabled: false, side: "top", top: 0, bottom: null, zIndex: null, onStick: null};
  }
  if (raw === true || raw === null || raw === undefined) {
    return {enabled: true, side: "top", top: 0, bottom: null, zIndex: null, onStick: null};
  }
  if (typeof raw === "number" || typeof raw === "string") {
    return {enabled: true, side: "top", top: raw, bottom: null, zIndex: null, onStick: null};
  }

  const config = typeof raw === "object" ? raw : {};
  const enabled = config.disabled ? false : getRawValue(config.enabled) !== false;
  const top = getRawValue(config.top);
  const bottom = getRawValue(config.bottom);
  const zIndex = getRawValue(config.zIndex);
  const onStick = getRawValue(config.onStick);
  let side = getRawValue(config.side);

  if (!["top", "bottom", "both"].includes(side)) {
    if (top !== null && top !== undefined && bottom !== null && bottom !== undefined) {
      side = "both";
    } else if (bottom !== null && bottom !== undefined && (top === null || top === undefined)) {
      side = "bottom";
    } else {
      side = "top";
    }
  }

  return {enabled, side, top, bottom, zIndex, onStick};
}

function setInlineStyle(el, property, value) {
  if (value === null || value === undefined || value === "") {
    el.style.removeProperty(property);
    return;
  }
  el.style[property] = value;
}

function getOrCreateState(el) {
  if (!el[STICKY_STATE_KEY]) {
    el[STICKY_STATE_KEY] = {
      initial: {
        position: el.style.position,
        top: el.style.top,
        bottom: el.style.bottom,
        zIndex: el.style.zIndex
      },
      config: normalizeConfig(undefined),
      lastStickyState: {top: false, bottom: false, sticked: false},
      scrollTargets: [],
      resizeListener: null,
      updateListener: null,
      frameId: 0
    };
  }
  return el[STICKY_STATE_KEY];
}

function clearStickyStateClasses(el) {
  el.classList.remove("top-sticky", "bottom-sticky", "sticked");
  el.removeAttribute("data-sticky");
  el.removeAttribute("data-sticky-top");
  el.removeAttribute("data-sticky-bottom");
}

function applyStickyStateClasses(el, stickyState) {
  el.classList.toggle("top-sticky", stickyState.top);
  el.classList.toggle("bottom-sticky", stickyState.bottom);
  el.classList.toggle("sticked", stickyState.sticked);
  el.setAttribute("data-sticky", stickyState.sticked ? "true" : "false");
  el.setAttribute("data-sticky-top", stickyState.top ? "true" : "false");
  el.setAttribute("data-sticky-bottom", stickyState.bottom ? "true" : "false");
}

function restoreInitialStyles(el, state) {
  const {initial} = state;
  setInlineStyle(el, "position", initial.position);
  setInlineStyle(el, "top", initial.top);
  setInlineStyle(el, "bottom", initial.bottom);
  setInlineStyle(el, "zIndex", initial.zIndex);
  clearStickyStateClasses(el);
}

function areStickyStatesEqual(prevState, nextState) {
  return prevState.top === nextState.top
    && prevState.bottom === nextState.bottom
    && prevState.sticked === nextState.sticked;
}

function collectScrollTargets(el) {
  const targets = [];
  let parent = el.parentElement;
  while (parent) {
    const styles = window.getComputedStyle(parent);
    const overflow = `${styles.overflow} ${styles.overflowX} ${styles.overflowY}`.toLowerCase();
    if (overflow.includes("auto") || overflow.includes("scroll") || overflow.includes("overlay")) {
      targets.push(parent);
    }
    parent = parent.parentElement;
  }
  targets.push(window);
  return Array.from(new Set(targets));
}

function unbindStickyListeners(state) {
  if (state.updateListener) {
    state.scrollTargets.forEach((target) => {
      target.removeEventListener("scroll", state.updateListener);
    });
    window.removeEventListener("resize", state.updateListener);
  }
  if (state.frameId) {
    cancelAnimationFrame(state.frameId);
    state.frameId = 0;
  }
  state.scrollTargets = [];
  state.resizeListener = null;
  state.updateListener = null;
}

function bindStickyListeners(el, state) {
  if (state.updateListener) {
    return;
  }

  state.updateListener = () => {
    if (state.frameId) {
      return;
    }
    state.frameId = requestAnimationFrame(() => {
      state.frameId = 0;
      updateStickyState(el, state);
    });
  };
  state.scrollTargets = collectScrollTargets(el);
  state.scrollTargets.forEach((target) => {
    target.addEventListener("scroll", state.updateListener, {passive: true});
  });
  window.addEventListener("resize", state.updateListener, {passive: true});
}

function computeStickyState(el, config) {
  if (!config.enabled) {
    return {top: false, bottom: false, sticked: false};
  }

  const rect = el.getBoundingClientRect();
  const topOffset = normalizeOffsetNumber(config.top, 0);
  const bottomOffset = normalizeOffsetNumber(config.bottom, 0);
  const isTopSticky = (config.side === "top" || config.side === "both")
    && rect.top <= topOffset + STICKY_EPSILON;
  const isBottomSticky = (config.side === "bottom" || config.side === "both")
    && (window.innerHeight - rect.bottom) <= bottomOffset + STICKY_EPSILON;

  return {
    top: isTopSticky,
    bottom: isBottomSticky,
    sticked: isTopSticky || isBottomSticky
  };
}

function dispatchStickState(el, config, stickyState) {
  if (typeof config.onStick === "function") {
    config.onStick(stickyState);
  }
  el.dispatchEvent(new CustomEvent(STICKY_EVENT_NAME, {
    detail: stickyState,
    bubbles: false
  }));
}

function updateStickyState(el, state) {
  const nextStickyState = computeStickyState(el, state.config);
  applyStickyStateClasses(el, nextStickyState);

  if (areStickyStatesEqual(state.lastStickyState, nextStickyState)) {
    return;
  }

  state.lastStickyState = nextStickyState;
  dispatchStickState(el, state.config, nextStickyState);
}

function applyStickyStyles(el, rawConfig) {
  const state = getOrCreateState(el);
  const config = normalizeConfig(rawConfig);
  state.config = config;

  if (!config.enabled) {
    unbindStickyListeners(state);
    restoreInitialStyles(el, state);
    updateStickyState(el, state);
    return;
  }

  bindStickyListeners(el, state);
  setInlineStyle(el, "position", "sticky");

  if (config.side === "top" || config.side === "both") {
    setInlineStyle(el, "top", normalizeLength(config.top, 0));
  } else {
    setInlineStyle(el, "top", null);
  }

  if (config.side === "bottom" || config.side === "both") {
    setInlineStyle(el, "bottom", normalizeLength(config.bottom, 0));
  } else {
    setInlineStyle(el, "bottom", null);
  }

  if (config.zIndex === null || config.zIndex === undefined || config.zIndex === "") {
    setInlineStyle(el, "zIndex", null);
  } else {
    setInlineStyle(el, "zIndex", String(config.zIndex));
  }

  updateStickyState(el, state);
}

export default {
  mounted(el, binding) {
    applyStickyStyles(el, binding.value);
  },
  updated(el, binding) {
    applyStickyStyles(el, binding.value);
  },
  unmounted(el) {
    const state = el[STICKY_STATE_KEY];
    if (!state) {
      return;
    }
    unbindStickyListeners(state);
    restoreInitialStyles(el, state);
    delete el[STICKY_STATE_KEY];
  }
};
