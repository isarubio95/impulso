'use client'

import Image from 'next/image'
import HeroImg from '@/assets/img/hero-image.png'
import LogoHero from '@/assets/img/logo-hero.png'
import CTA from '../components/CTA'
import { FaShoppingBag } from 'react-icons/fa'
import { motion } from 'framer-motion'

export default function Hero() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20, filter: 'blur(10px)' },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: { type: 'spring', stiffness: 100, damping: 20 },
    },
  }

  const imageVariants = {
    hidden: { opacity: 0, scale: 0.9, x: 40 },
    visible: {
      opacity: 1,
      scale: 1,
      x: 0,
      transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.4 },
    },
  }

  return (
    <section
      className="h-[80vh] overflow-hidden"
      style={{ background: 'linear-gradient(to bottom, #ffffff 80%, #E7E5E4 100%)' }}
    >
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="container sm:px-10 max-w-3xl mx-auto h-full grid grid-cols-1 sm:grid-cols-2 gap-18 px-4 items-stretch"
      >
        <div className="order-2 w-full h-full sm:order-1 flex items-center justify-center">
          <div className="relative isolate w-fit max-w-lg text-center flex flex-col items-center sm:items-start justify-center">
            
            {/* Logo de fondo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 0.08, scale: 1 }}
              transition={{ duration: 2, ease: "easeOut" }}
              className="pointer-events-none select-none absolute inset-0 m-auto -z-10 flex items-center justify-center"
            >
              <Image
                src={LogoHero}
                alt="Logotipo"
                priority
                className="object-contain"
                sizes="(max-width: 640px) 90vw, 40vw"
              />
            </motion.div>

            {/* Contenido de texto */}
            <div className="z-10 flex flex-col items-center sm:items-start gap-3">
              <motion.h1 
                variants={itemVariants} 
                className="text-6xl font-medium text-rose-800"
              >
                IMPULSO
              </motion.h1>
              
              <motion.p 
                variants={itemVariants} 
                className="text-xl font-medium text-stone-700 mb-3"
              >
                Centro de Bienestar en Logroño
              </motion.p>

              <motion.div variants={itemVariants} className="w-fit">
                <CTA
                  href="/tienda"
                  texto="Ir a la tienda"
                  icono={<FaShoppingBag className="w-4 h-4 text-rose-50" />}
                />
              </motion.div>
            </div>
          </div>
        </div>

        {/* Imagen derecha */}
        <motion.div 
          variants={imageVariants}
          className="order-1 sm:order-2 hidden sm:flex h-full items-center"
        >
          <div className="relative h-[70%] min-h-[420px] w-full flex border-b border-rose-800">
            <Image
              src={HeroImg}
              alt="Hero"
              fill
              className="object-contain drop-shadow-sm"
              priority
              sizes="(max-width: 1024px) 50vw, 600px"
            />
          </div>
        </motion.div>
      </motion.div>
    </section>
  )
}