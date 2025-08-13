'use client'

import { useState, ReactNode, useRef, useEffect } from 'react'

interface TooltipProps {
  children: ReactNode
  content: string | ReactNode
  className?: string
  position?: 'top' | 'bottom' | 'left' | 'right'
}

export default function Tooltip({ 
  children, 
  content, 
  className = '',
  position = 'top' 
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [actualPosition, setActualPosition] = useState(position)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isVisible && tooltipRef.current && triggerRef.current) {
      const tooltip = tooltipRef.current
      const trigger = triggerRef.current
      const rect = trigger.getBoundingClientRect()
      const tooltipRect = tooltip.getBoundingClientRect()
      
      let newPosition = position
      
      // Check if tooltip would go off screen and adjust position
      if (position === 'top' && rect.top - tooltipRect.height < 10) {
        newPosition = 'bottom'
      } else if (position === 'bottom' && rect.bottom + tooltipRect.height > window.innerHeight - 10) {
        newPosition = 'top'
      } else if (position === 'left' && rect.left - tooltipRect.width < 10) {
        newPosition = 'right'
      } else if (position === 'right' && rect.right + tooltipRect.width > window.innerWidth - 10) {
        newPosition = 'left'
      }
      
      setActualPosition(newPosition)
    }
  }, [isVisible, position])

  const positionClasses = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2'
  }

  const arrowClasses = {
    top: 'top-full left-1/2 transform -translate-x-1/2 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900',
    bottom: 'bottom-full left-1/2 transform -translate-x-1/2 border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent border-b-gray-900',
    left: 'left-full top-1/2 transform -translate-y-1/2 border-t-4 border-b-4 border-l-4 border-t-transparent border-b-transparent border-l-gray-900',
    right: 'right-full top-1/2 transform -translate-y-1/2 border-t-4 border-b-4 border-r-4 border-t-transparent border-b-transparent border-r-gray-900'
  }

  return (
    <div 
      ref={triggerRef}
      className={`relative inline-block ${className}`}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      
      {isVisible && (
        <div 
          ref={tooltipRef}
          className={`fixed z-50 pointer-events-none`}
          style={{
            minWidth: '300px',
            maxWidth: '400px',
            left: actualPosition === 'top' || actualPosition === 'bottom' ? 
              `${triggerRef.current?.getBoundingClientRect().left + (triggerRef.current?.getBoundingClientRect().width || 0) / 2}px` :
              actualPosition === 'left' ? 
                `${triggerRef.current?.getBoundingClientRect().left - 310}px` :
                `${triggerRef.current?.getBoundingClientRect().right + 10}px`,
            top: actualPosition === 'top' ? 
              `${triggerRef.current?.getBoundingClientRect().top - 10}px` :
              actualPosition === 'bottom' ?
                `${triggerRef.current?.getBoundingClientRect().bottom + 10}px` :
                `${triggerRef.current?.getBoundingClientRect().top + (triggerRef.current?.getBoundingClientRect().height || 0) / 2}px`,
            transform: actualPosition === 'top' || actualPosition === 'bottom' ? 
              'translateX(-50%) translateY(' + (actualPosition === 'top' ? '-100%' : '0%') + ')' :
              'translateY(-50%)'
          }}
        >
          <div className="px-4 py-3 text-sm text-white bg-gray-900 rounded-lg shadow-xl">
            {content}
          </div>
          <div 
            className={`absolute w-0 h-0 ${arrowClasses[actualPosition]}`}
            style={{
              left: actualPosition === 'top' || actualPosition === 'bottom' ? '50%' : 
                    actualPosition === 'left' ? '100%' : '-8px',
              top: actualPosition === 'left' || actualPosition === 'right' ? '50%' : 
                   actualPosition === 'top' ? '100%' : '-8px',
              transform: actualPosition === 'top' || actualPosition === 'bottom' ? 'translateX(-50%)' : 
                        actualPosition === 'left' || actualPosition === 'right' ? 'translateY(-50%)' : 'none'
            }}
          ></div>
        </div>
      )}
    </div>
  )
}