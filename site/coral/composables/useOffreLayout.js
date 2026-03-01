import {onMounted, onUnmounted, ref} from "vue";

function resolveLayoutMode() {
  if (typeof window === 'undefined') {
    return 'desktop';
  }
  return window.matchMedia('(max-width: 768px)').matches ? 'mobile' : 'desktop';
}

function resolveControlsOffset() {
  if (typeof window === 'undefined') {
    return 0;
  }
  if (window.matchMedia('(max-width: 768px)').matches) {
    return 54;
  }
  if (window.matchMedia('(min-width: 769px) and (max-width: 992px)').matches) {
    return 40;
  }
  return 0;
}

export function useOffreLayout() {
  const layoutMode = ref(resolveLayoutMode());
  const controlsAffixOffset = ref(resolveControlsOffset());

  let teardown = () => {
  };

  onMounted(() => {
    const layout = matchMedia('(max-width:768px)');
    const smallLayout = matchMedia('(max-width: 768px)');
    const mediumLayout = matchMedia('(min-width: 769px) and (max-width:992px)');
    const wideLayout = matchMedia('(min-width: 993px)');

    const updateLayoutMode = () => {
      layoutMode.value = layout.matches ? 'mobile' : 'desktop';
    };

    const updateControlsOffset = () => {
      if (smallLayout.matches) {
        controlsAffixOffset.value = 54;
      } else if (mediumLayout.matches) {
        controlsAffixOffset.value = 40;
      } else if (wideLayout.matches) {
        controlsAffixOffset.value = 0;
      }
    };

    layout.addEventListener('change', updateLayoutMode);
    smallLayout.addEventListener('change', updateControlsOffset);
    mediumLayout.addEventListener('change', updateControlsOffset);
    wideLayout.addEventListener('change', updateControlsOffset);

    updateLayoutMode();
    updateControlsOffset();

    teardown = () => {
      layout.removeEventListener('change', updateLayoutMode);
      smallLayout.removeEventListener('change', updateControlsOffset);
      mediumLayout.removeEventListener('change', updateControlsOffset);
      wideLayout.removeEventListener('change', updateControlsOffset);
    };
  });

  onUnmounted(() => {
    teardown();
  });

  return {
    layoutMode,
    controlsAffixOffset
  };
}
