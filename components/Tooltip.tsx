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
      const viewport = {
        width: window.innerWidth,
        height: window.innerHeight
      }
      
      let newPosition = position
      
      // Calculate available space in all directions
      const spaceAbove = rect.top
      const spaceBelow = viewport.height - rect.bottom
      const spaceLeft = rect.left
      const spaceRight = viewport.width - rect.right
      
      // Minimum space needed (with padding)
      const minSpace = 20
      const tooltipHeight = tooltipRect.height || 120 // estimated height if not calculated yet
      const tooltipWidth = tooltipRect.width || 300 // estimated width if not calculated yet
      
      // Smart positioning logic - choose the position with most available space
      if (position === 'top' || position === 'bottom') {
        // For vertical positions, check if there's enough space above or below
        const needsSpaceAbove = tooltipHeight + minSpace
        const needsSpaceBelow = tooltipHeight + minSpace
        
        if (position === 'top' && spaceAbove < needsSpaceAbove) {
          // Not enough space above, try below
          if (spaceBelow >= needsSpaceBelow) {
            newPosition = 'bottom'
          } else {
            // Not enough space above or below, choose the side with more space
            newPosition = spaceAbove > spaceBelow ? 'top' : 'bottom'
          }
        } else if (position === 'bottom' && spaceBelow < needsSpaceBelow) {
          // Not enough space below, try above
          if (spaceAbove >= needsSpaceAbove) {
            newPosition = 'top'
          } else {
            // Not enough space above or below, choose the side with more space
            newPosition = spaceAbove > spaceBelow ? 'top' : 'bottom'
          }
        }
      } else {
        // For horizontal positions
        const needsSpaceLeft = tooltipWidth + minSpace
        const needsSpaceRight = tooltipWidth + minSpace
        
        if (position === 'left' && spaceLeft < needsSpaceLeft) {
          newPosition = spaceRight >= needsSpaceRight ? 'right' : (spaceLeft > spaceRight ? 'left' : 'right')
        } else if (position === 'right' && spaceRight < needsSpaceRight) {
          newPosition = spaceLeft >= needsSpaceLeft ? 'left' : (spaceLeft > spaceRight ? 'left' : 'right')
        }
      }
      
      setActualPosition(newPosition)
    }
  }, [isVisible, position])

  // Position classes for tooltip positioning - currently unused but kept for future use
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
            left: (() => {
              const triggerRect = triggerRef.current?.getBoundingClientRect()
              if (!triggerRect) return '0px'
              
              if (actualPosition === 'top' || actualPosition === 'bottom') {
                // Center horizontally, but constrain to viewport
                let left = triggerRect.left + triggerRect.width / 2
                const tooltipWidth = 350 // account for min/max width
                
                // Ensure tooltip doesn't go off left edge
                if (left - tooltipWidth / 2 < 10) {
                  left = tooltipWidth / 2 + 10
                }
                // Ensure tooltip doesn't go off right edge
                if (left + tooltipWidth / 2 > window.innerWidth - 10) {
                  left = window.innerWidth - tooltipWidth / 2 - 10
                }
                
                return `${left}px`
              } else if (actualPosition === 'left') {
                return `${Math.max(10, triggerRect.left - 310)}px`
              } else {
                return `${Math.min(window.innerWidth - 310, triggerRect.right + 10)}px`
              }
            })(),
            top: (() => {
              const triggerRect = triggerRef.current?.getBoundingClientRect()
              if (!triggerRect) return '0px'
              
              if (actualPosition === 'top') {
                return `${Math.max(10, triggerRect.top - 10)}px`
              } else if (actualPosition === 'bottom') {
                const maxTop = window.innerHeight - 150 // account for tooltip height
                return `${Math.min(maxTop, triggerRect.bottom + 10)}px`
              } else {
                // left or right position
                return `${triggerRect.top + triggerRect.height / 2}px`
              }
            })(),
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