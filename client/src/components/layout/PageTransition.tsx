import { motion } from 'motion/react'
import { pageVariants } from '../../styles/animations'

interface PageTransitionProps {
  children: React.ReactNode
}

export function PageTransition({ children }: PageTransitionProps) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="h-full will-change-transform"
      style={{ transformOrigin: 'center top' }}
    >
      {children}
    </motion.div>
  )
}
