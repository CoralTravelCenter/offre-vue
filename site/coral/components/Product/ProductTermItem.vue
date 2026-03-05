<script setup>
import {cn} from "app/lib/utils";

const props = defineProps({
  icon: {
    type: String,
    required: true
  },
  class: {
    type: [Boolean, null, String, Object, Array],
    required: false,
    skipCheck: true
  },
  iconClass: {
    type: [Boolean, null, String, Object, Array],
    required: false,
    skipCheck: true
  }
});
</script>

<template>
  <li :class="cn('product-term-item inline-flex items-center gap-1 text-[rgba(0,0,0,0.65)]', props.class)">
    <svg
        v-if="icon === 'flight'"
        :class="cn('product-term-item__icon', props.iconClass)"
        viewBox="0 0 42 33"
        fill="none"
        aria-hidden="true"
    >
      <path
          d="M0.348289 31.913H42M3.99903 13.4797L9.87 11.3428L14.097 15.3449L18.2212 13.8438L13.0947 5.8481L20.6565 5.31209L27.0276 10.6386L34.1561 8.044C35.7773 7.45393 37.5699 8.28984 38.16 9.91106C38.7501 11.5323 37.9142 13.3249 36.293 13.915L12.8091 22.4624L3.99903 13.4797Z"
          stroke="currentColor"
          stroke-linejoin="round"
      />
    </svg>

    <svg
        v-else-if="icon === 'calendar'"
        :class="cn('product-term-item__icon', props.iconClass)"
        viewBox="0 0 32 33"
        fill="none"
        aria-hidden="true"
    >
      <path
          d="M0.941177 6.78405C0.941177 5.67948 1.83661 4.78405 2.94118 4.78405H29.0588C30.1634 4.78405 31.0588 5.67948 31.0588 6.78405V29.8899C31.0588 30.9945 30.1634 31.8899 29.0588 31.8899H2.94118C1.83661 31.8899 0.941177 30.9945 0.941177 29.8899V6.78405Z"
          stroke="currentColor"
          stroke-linejoin="round"
      />
      <path
          d="M0.941177 6.78405C0.941177 5.67948 1.83661 4.78405 2.94118 4.78405H29.0588C30.1634 4.78405 31.0588 5.67948 31.0588 6.78405V12.3135H0.941177V6.78405Z"
          stroke="currentColor"
          stroke-linejoin="round"
      />
      <path d="M5.45882 7.04287V1.77228" stroke="currentColor"/>
      <path d="M16 7.04287V1.77228" stroke="currentColor"/>
      <path d="M26.5412 7.04287V1.77228" stroke="currentColor"/>
      <path d="M6.21177 18.337H9.22353" stroke="currentColor"/>
      <path d="M6.21177 24.3605H9.22353" stroke="currentColor"/>
      <path d="M14.4941 18.337H17.5059" stroke="currentColor"/>
      <path d="M14.4941 24.3605H17.5059" stroke="currentColor"/>
      <path d="M22.7765 18.337H25.7882" stroke="currentColor"/>
      <path d="M22.7765 24.3605H25.7882" stroke="currentColor"/>
    </svg>

    <svg
        v-else-if="icon === 'bed'"
        :class="cn('product-term-item__icon', props.iconClass)"
        viewBox="0 0 40 33"
        fill="none"
        aria-hidden="true"
    >
      <path
          d="M2.66666 16.2463C2.66666 15.1418 3.56209 14.2463 4.66666 14.2463H36.2222C37.3268 14.2463 38.2222 15.1418 38.2222 16.2463V23.1352H2.66666V16.2463Z"
          stroke="currentColor"
          stroke-linejoin="round"
      />
      <path
          d="M2.66666 23.1352H38.2222V31.1352H33.7778L31.1111 27.5797H9.77778L7.11111 31.1352H2.66666V23.1352Z"
          stroke="currentColor"
          stroke-linejoin="round"
      />
      <path
          d="M4.44446 5.57966C4.44446 4.47509 5.33989 3.57966 6.44446 3.57966H34.4445C35.549 3.57966 36.4445 4.47509 36.4445 5.57966V14.2463H4.44446V5.57966Z"
          stroke="currentColor"
          stroke-linejoin="round"
      />
      <path
          d="M10.6667 9.913C10.6667 9.36071 11.1144 8.91299 11.6667 8.91299H16.7778C17.3301 8.91299 17.7778 9.36071 17.7778 9.91299V14.2463H10.6667V9.913Z"
          stroke="currentColor"
          stroke-linejoin="round"
      />
      <path
          d="M23.1111 9.913C23.1111 9.36071 23.5588 8.91299 24.1111 8.91299H29.2222C29.7745 8.91299 30.2222 9.36071 30.2222 9.91299V14.2463H23.1111V9.913Z"
          stroke="currentColor"
          stroke-linejoin="round"
      />
    </svg>

    <svg
        v-else-if="icon === 'meal'"
        :class="cn('product-term-item__icon', props.iconClass)"
        viewBox="0 0 43 33"
        fill="none"
        aria-hidden="true"
    >
      <path
          d="M0.941177 1.77228V9.8115C0.941177 10.9161 1.83661 11.8115 2.94118 11.8115H8.98039C10.085 11.8115 10.9804 10.9161 10.9804 9.8115V1.77228"
          stroke="currentColor"
          stroke-linejoin="round"
      />
      <path
          d="M31.0588 11.8193V3.77228C31.0588 2.66771 31.9543 1.77228 33.0588 1.77228H39.098C40.2026 1.77228 41.098 2.66771 41.098 3.77228V11.8193C41.098 12.9239 40.2026 13.8193 39.098 13.8193H33.0588C31.9543 13.8193 31.0588 12.9239 31.0588 11.8193Z"
          stroke="currentColor"
          stroke-linejoin="round"
      />
      <path d="M5.9608 1.77228V26.289" stroke="currentColor" stroke-linejoin="round"/>
      <path d="M36.0784 13.8193V26.289" stroke="currentColor" stroke-linejoin="round"/>
      <circle cx="21.0196" cy="21.8507" r="10.0392" stroke="currentColor" stroke-linejoin="round"/>
      <path
          d="M26.0392 21.8507C26.0392 19.0785 23.7919 16.8311 21.0196 16.8311M21.0196 26.8703C18.2474 26.8703 16 24.623 16 21.8507"
          stroke="currentColor"
          stroke-linejoin="round"
      />
    </svg>

    <slot/>
  </li>
</template>
