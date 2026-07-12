import { motion } from 'framer-motion'

const EASE = [0.22, 1, 0.36, 1]

export default function Reveal({ children, delay = 0, y = 40, className, ...rest }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.9, delay, ease: EASE }}
      {...rest}
    >
      {children}
    </motion.div>
  )
}

export { EASE }
