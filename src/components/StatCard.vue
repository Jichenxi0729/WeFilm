<template>
  <div class="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
    <div class="flex items-center justify-between">
      <div>
        <p class="text-xs text-gray-500 uppercase tracking-wide">{{ label }}</p>
        <p class="text-2xl font-bold text-gray-900 mt-1">{{ value }}</p>
      </div>
      <div 
        class="w-12 h-12 rounded-xl flex items-center justify-center"
        :class="iconBgClass"
      >
        <slot name="icon">
          <svg class="w-6 h-6" :class="iconClass" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        </slot>
      </div>
    </div>
    <slot name="footer"></slot>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  label: {
    type: String,
    required: true
  },
  value: {
    type: [String, Number],
    required: true
  },
  variant: {
    type: String,
    default: 'blue'
  }
})

const variantClasses = {
  blue: { iconBg: 'bg-blue-100', icon: 'text-blue-600' },
  green: { iconBg: 'bg-green-100', icon: 'text-green-600' },
  yellow: { iconBg: 'bg-yellow-100', icon: 'text-yellow-600' },
  red: { iconBg: 'bg-red-100', icon: 'text-red-600' },
  purple: { iconBg: 'bg-purple-100', icon: 'text-purple-600' }
}

const iconBgClass = computed(() => variantClasses[props.variant]?.iconBg || variantClasses.blue.iconBg)
const iconClass = computed(() => variantClasses[props.variant]?.icon || variantClasses.blue.icon)
</script>
