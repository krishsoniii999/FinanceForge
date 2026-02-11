import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface OnboardingState {
  completed: boolean
  currentStep: number
  setStep: (step: number) => void
  complete: () => void
  reset: () => void
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      completed: false,
      currentStep: 0,
      setStep: (step) => set({ currentStep: step }),
      complete: () => set({ completed: true, currentStep: 0 }),
      reset: () => set({ completed: false, currentStep: 0 }),
    }),
    { name: 'financeforge-onboarding' }
  )
)
