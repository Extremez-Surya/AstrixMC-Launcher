import { useState, useEffect } from 'react'
import InstallerModal from './InstallerModal'
import AddAccountModal from './AddAccountModal'
import CreateProfileScreen from './CreateProfileScreen'
import { useAuth } from '../../hooks/useAuth'
import { useInstances } from '../../hooks/useInstances'

interface OnboardingFlowProps {
  children: React.ReactNode
}

type OnboardingStep = 'installer' | 'account' | 'profile' | 'ready'

export default function OnboardingFlow({ children }: OnboardingFlowProps) {
  const { activeAccount } = useAuth()
  const { instances } = useInstances()

  const [step, setStep] = useState<OnboardingStep>(() => {
    const isInstalled = localStorage.getItem('astrix_installed') === 'true' || localStorage.getItem('fastclient_installed') === 'true'
    if (!isInstalled) return 'installer'
    return 'ready'
  })

  // Determine current active step dynamically based on prerequisites
  useEffect(() => {
    const isInstalled = localStorage.getItem('astrix_installed') === 'true' || localStorage.getItem('fastclient_installed') === 'true'
    if (!isInstalled) {
      setStep('installer')
      return
    }

    if (!activeAccount) {
      setStep('account')
      return
    }

    if (instances.length === 0) {
      setStep('profile')
      return
    }

    setStep('ready')
  }, [activeAccount, instances])

  const handleInstallerComplete = () => {
    localStorage.setItem('astrix_installed', 'true')
    if (!activeAccount) {
      setStep('account')
    } else if (instances.length === 0) {
      setStep('profile')
    } else {
      setStep('ready')
    }
  }

  const handleAccountComplete = () => {
    if (instances.length === 0) {
      setStep('profile')
    } else {
      setStep('ready')
    }
  }

  const handleProfileComplete = () => {
    setStep('ready')
  }

  if (step === 'installer') {
    return <InstallerModal onComplete={handleInstallerComplete} />
  }

  if (step === 'account') {
    return <AddAccountModal onComplete={handleAccountComplete} />
  }

  if (step === 'profile') {
    return <CreateProfileScreen onComplete={handleProfileComplete} />
  }

  return <>{children}</>
}
