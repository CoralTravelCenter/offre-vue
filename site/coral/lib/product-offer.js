const PRICE_SUFFIX_MAP = {
  detailed: {
    'per-person': '<span class="per-person"> / чел</span>',
    'per-night': '<span class="per-night"> за ночь</span>',
    default: ''
  },
  compact: {
    'per-person': '',
    'per-night': '',
    default: ''
  }
};

const PRICING_ALIASES = Object.freeze({
  'per-person': 'per-person',
  perperson: 'per-person',
  per_person: 'per-person',
  perpassenger: 'per-person',
  passenger: 'per-person',
  pax: 'per-person',
  person: 'per-person',
  'per person': 'per-person',
  'per-night': 'per-night',
  pernight: 'per-night',
  per_night: 'per-night',
  pernights: 'per-night',
  perday: 'per-night',
  night: 'per-night',
  'per night': 'per-night',
  default: 'default'
});

export function normalizePricingOption(value) {
  const extractedValue = (
    value && typeof value === 'object'
      ? (value.value ?? value.id ?? value.key ?? value.name ?? value.label)
      : value
  );
  const raw = String(extractedValue ?? 'default').trim().toLowerCase();

  if (PRICING_ALIASES[raw]) {
    return PRICING_ALIASES[raw];
  }

  if (raw.includes('person') || raw.includes('passenger') || raw.includes('pax') || raw.includes('чел')) {
    return 'per-person';
  }
  if (raw.includes('night') || raw.includes('day') || raw.includes('ноч')) {
    return 'per-night';
  }

  return 'default';
}

export function formatCurrencySafe(value, currency) {
  if (value == null) {
    return '';
  }
  return typeof value.formatCurrency === 'function'
    ? value.formatCurrency(currency)
    : '';
}

export function resolvePriceSuffix(priceLabelMode, pricingOption) {
  const selectedMode = PRICE_SUFFIX_MAP[priceLabelMode] || PRICE_SUFFIX_MAP.detailed;
  const normalizedPricingOption = normalizePricingOption(pricingOption);
  return selectedMode[normalizedPricingOption] || selectedMode.default;
}

export function syncReactiveObject(target, source) {
  for (const key of Object.keys(target)) {
    if (!(key in source)) {
      delete target[key];
    }
  }
  Object.assign(target, source);
}

export function buildOfferHref({
  redirectionUrl,
  queryParam,
  isHotelOnly,
  tourType,
  hostname
}) {
  if (!redirectionUrl) {
    return '#';
  }
  const host = hostname === 'localhost' ? '//coral.ru' : '';
  const urlFix = redirectionUrl.includes('/hotels') ? '' : '/hotels';
  const productType = (isHotelOnly || tourType !== 'package') ? 2 : 1;
  return `${host}${urlFix}${redirectionUrl}/?${queryParam || ''}&p=${productType}`;
}
