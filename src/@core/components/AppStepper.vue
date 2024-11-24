<script setup>
const props = defineProps({
  items: {
    type: Array,
    required: true,
  },
  currentStep: {
    type: Number,
    required: false,
    default: 0,
  },
  direction: {
    type: String,
    required: false,
    default: 'horizontal',
  },
  iconSize: {
    type: [
      String,
      Number,
    ],
    required: false,
    default: 52,
  },
  isActiveStepValid: {
    type: Boolean,
    required: false,
    default: undefined,
  },
  align: {
    type: String,
    required: false,
    default: 'center',
  },
})

const emit = defineEmits(['update:currentStep'])

const currentStep = ref(props.currentStep || 0)
const activeOrCompletedStepsClasses = computed(() => index => index < currentStep.value ? 'stepper-steps-completed' : index === currentStep.value ? 'stepper-steps-active' : '')
const isHorizontalAndNotLastStep = computed(() => index => props.direction === 'horizontal' && props.items.length - 1 !== index)

// check if validation is enabled
const isValidationEnabled = computed(() => {
  return props.isActiveStepValid !== undefined
})

watchEffect(() => {
  if (props.currentStep !== undefined && props.currentStep < props.items.length && props.currentStep >= 0)
    currentStep.value = props.currentStep
  emit('update:currentStep', currentStep.value)
})
</script>

<template>
  <VSlideGroup
    v-model="currentStep"
    class="app-stepper"
    show-arrows
    :direction="props.direction"
    :class="`app-stepper-${props.align}`"
  >
    <VSlideGroupItem
      v-for="(item, index) in props.items"
      :key="item.title"
      :value="index"
    >
      <div
        class="cursor-pointer mx-1"
        :class="[
          (!props.isActiveStepValid && (isValidationEnabled)) && 'stepper-steps-invalid',
          activeOrCompletedStepsClasses(index),
        ]"
        @click="!isValidationEnabled && emit('update:currentStep', index)"
      >
        <!-- SECTION stepper step with icon -->
        <template v-if="item.icon">
          <div class="stepper-icon-step text-high-emphasis d-flex align-center gap-2">
            <!-- 👉 icon and title -->
            <div
              class="d-flex align-center gap-4 step-wrapper"
              :class="[props.direction === 'horizontal' && 'flex-column']"
            >
              <div class="stepper-icon">
                <VIcon
                  :icon="item.icon"
                  :size="item.size || props.iconSize"
                />
              </div>

              <div>
                <p class="stepper-title font-weight-medium mb-0">
                  {{ item.title }}
                </p>
                <span
                  v-if="item.subtitle"
                  class="stepper-subtitle"
                >
                  <span class="text-sm">{{ item.subtitle }}</span>
                </span>
              </div>
            </div>

            <!-- 👉 append chevron -->
            <VIcon
              v-if="isHorizontalAndNotLastStep(index)"
              class="flip-in-rtl stepper-chevron-indicator mx-6"
              size="24"
              icon="tabler-chevron-right"
            />
          </div>
        </template>
        <!-- !SECTION  -->

        <!-- SECTION stepper step without icon -->
        <template v-else>
          <div class="d-flex align-center gap-x-4">
            <div class="d-flex align-center gap-2">
              <div class="d-flex align-center justify-center">
                <!-- 👉 custom circle icon -->
                <template v-if="index >= currentStep">
                  <VBtn
                    v-if="(!isValidationEnabled || props.isActiveStepValid || index !== currentStep)"
                    size="40"
                    :variant="index === currentStep ? 'elevated' : 'tonal'"
                    :color="index === currentStep ? 'primary' : 'default'"
                  >
                    <h5
                      class="text-h5"
                      :style="index === currentStep ? { color: '#fff' } : ''"
                    >
                      {{ index + 1 }}
                    </h5>
                  </VBtn>

                  <VIcon
                    v-else
                    icon="tabler-alert-circle"
                    size="24"
                    color="error"
                  />
                </template>

                <!-- 👉 step completed icon -->

                <VBtn
                  v-else
                  class="stepper-icon"
                  variant="tonal"
                  color="primary"
                  size="40"
                >
                  <h5
                    class="text-h5"
                    style="color: rgb(var(--v-theme-primary))"
                  >
                    {{ index + 1 }}
                  </h5>
                </VBtn>
              </div>
            </div>

            <!-- 👉 title and subtitle -->
            <div class="d-flex flex-column justify-center">
              <div class="step-title font-weight-medium">
                {{ item.title }}
              </div>

              <div
                v-if="item.subtitle"
                class="step-subtitle text-sm text-disabled"
              >
                {{ item.subtitle }}
              </div>
            </div>

            <!-- 👉 stepper step icon -->
            <div
              v-if="isHorizontalAndNotLastStep(index)"
              class="stepper-step-line"
            >
              <VIcon
                icon="tabler-chevron-right"
                size="24"
              />
            </div>
          </div>
        </template>
        <!-- !SECTION  -->
      </div>
    </VSlideGroupItem>
  </VSlideGroup>
</template>

<style lang="scss">
.app-stepper {
  // 👉 stepper step with bg color
  &.stepper-icon-step-bg {
    .stepper-icon-step {
      .step-wrapper {
        flex-direction: row !important;
      }

      .stepper-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 0.3125rem;
        background-color: rgba(var(--v-theme-on-surface), var(--v-selected-opacity));
        block-size: 2.5rem;
        color: rgba(var(--v-theme-on-surface), var(--v-high-emphasis-opacity));
        inline-size: 2.5rem;
        margin-inline-end: 0.3rem;
      }

      .stepper-title,
      .stepper-subtitle {
        line-height: normal;
      }

      .stepper-title {
        color: rgba(var(--v-theme-on-surface), var(--v-high-emphasis-opacity));
        font-size: 0.9375rem;
        font-weight: 500 !important;
      }

      .stepper-subtitle {
        color: rgba(var(--v-theme-on-surface), var(--v-disabled-opacity));
        font-size: 0.875rem;
      }
    }

    .stepper-steps-active {
      .stepper-icon-step {
        .stepper-icon {
          background-color: rgb(var(--v-theme-primary));
          color: rgba(var(--v-theme-on-primary));
        }
      }
    }

    .stepper-steps-completed {
      .stepper-icon-step {
        .stepper-icon {
          background: rgba(var(--v-theme-primary), 0.08);
          color: rgba(var(--v-theme-primary));
        }
      }
    }
  }

  // 👉 stepper step with icon and  default
  .v-slide-group__content {
    row-gap: 1.5rem;

    .stepper-step-indicator {
      block-size: 3rem;
      opacity: var(--v-activated-opacity);
    }

    .stepper-step-line {
      opacity: var(--v-activated-opacity);
    }

    .stepper-chevron-indicator {
      color: rgba(var(--v-theme-on-surface), var(--v-disabled-opacity));
    }

    .stepper-steps-completed,
    .stepper-steps-active {
      .stepper-icon-step,
      .stepper-step-icon {
        color: rgb(var(--v-theme-primary)) !important;
      }

      .stepper-step-indicator {
        opacity: 1;
      }
    }

    .stepper-steps-completed {
      .stepper-step-line {
        opacity: 1;
      }

      .stepper-chevron-indicator {
        color: rgb(var(--v-theme-primary));
      }
    }

    .stepper-steps-invalid.stepper-steps-active {
      .stepper-icon-step,
      .step-number,
      .step-title,
      .step-subtitle {
        color: rgb(var(--v-theme-error)) !important;
      }
    }

  }

  // 👉 stepper alignment
  &.app-stepper-center {
    .v-slide-group__content {
      justify-content: center;
    }
  }

  &.app-stepper-start {
    .v-slide-group__content {
      justify-content: start;
    }
  }

  &.app-stepper-end {
    .v-slide-group__content {
      justify-content: end;
    }
  }
}
</style>
