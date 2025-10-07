'use client'

import { useState, ReactNode, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'

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
  const [coords, setCoords] = useState({ top: 0, left: 0 })
  const [actualPosition, setActualPosition] = useState(position)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  useEffect(() => {
    if (isVisible && triggerRef.current) {
      const updatePosition = () => {
        const triggerRect = triggerRef.current?.getBoundingClientRect()
        if (!triggerRect) return

        const tooltipEl = tooltipRef.current
        if (!tooltipEl) {
          // Initial positioning before tooltip is rendered
          setCoords({
            top: triggerRect.top,
            left: triggerRect.left
          })
          return
        }

        const tooltipRect = tooltipEl.getBoundingClientRect()
        const spacing = 10
        const arrowSize = 8
        
        // Calculate available space
        const viewport = {
          width: window.innerWidth,
          height: window.innerHeight
        }
        
        const space = {
          top: triggerRect.top,
          bottom: viewport.height - triggerRect.bottom,
          left: triggerRect.left,
          right: viewport.width - triggerRect.right
        }
        
        let newPosition = position
        let top = 0
        let left = 0
        
        // Check if preferred position has enough space
        if (position === 'bottom' && space.bottom < tooltipRect.height + spacing) {
          newPosition = space.top > tooltipRect.height + spacing ? 'top' : 'top'
        } else if (position === 'top' && space.top < tooltipRect.height + spacing) {
          newPosition = space.bottom > tooltipRect.height + spacing ? 'bottom' : 'bottom'
        }
        
        // Calculate final position
        switch (newPosition) {
          case 'top':
            top = Math.max(20, triggerRect.top - tooltipRect.height - spacing - arrowSize)
            left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2
            break
          case 'bottom':
            top = Math.min(
              viewport.height - tooltipRect.height - 20,
              triggerRect.bottom + spacing + arrowSize
            )
            left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2
            break
          case 'left':
            top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2
            left = Math.max(20, triggerRect.left - tooltipRect.width - spacing - arrowSize)
            break
          case 'right':
            top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2
            left = Math.min(
              viewport.width - tooltipRect.width - 20,
              triggerRect.right + spacing + arrowSize
            )
            break
        }
        
        // Ensure tooltip stays within viewport horizontally
        if (left < 20) left = 20
        if (left + tooltipRect.width > viewport.width - 20) {
          left = viewport.width - tooltipRect.width - 20
        }
        
        // Ensure tooltip stays within viewport vertically
        if (top < 20) top = 20
        if (top + tooltipRect.height > viewport.height - 20) {
          top = viewport.height - tooltipRect.height - 20
        }
        
        setActualPosition(newPosition)
        setCoords({ top, left })
      }
      
      // Update position immediately and after a small delay to account for content rendering
      updatePosition()
      const timer = setTimeout(updatePosition, 10)
      
      return () => clearTimeout(timer)
    }
  }, [isVisible, position])

  const tooltipContent = (
    <div 
      ref={tooltipRef}
      className="fixed z-[9999] pointer-events-none"
      style={{
        top: `${coords.top}px`,
        left: `${coords.left}px`,
        minWidth: '250px',
        maxWidth: 'min(450px, calc(100vw - 20px))'
      }}
    >
      <div className="relative">
        <div 
          className="px-4 py-3 text-sm text-white bg-gray-900 rounded-lg shadow-xl"
          style={{
            maxHeight: 'min(500px, calc(100vh - 60px))',
            overflowY: 'auto',
            overflowX: 'hidden'
          }}
        >
          {content}
        </div>
        {/* Arrow */}
        <div 
          className={`absolute w-0 h-0 ${
            actualPosition === 'top' 
              ? 'top-full left-1/2 -translate-x-1/2 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900'
              : actualPosition === 'bottom'
              ? 'bottom-full left-1/2 -translate-x-1/2 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-900'
              : actualPosition === 'left'
              ? 'left-full top-1/2 -translate-y-1/2 border-t-4 border-b-4 border-l-4 border-transparent border-l-gray-900'
              : 'right-full top-1/2 -translate-y-1/2 border-t-4 border-b-4 border-r-4 border-transparent border-r-gray-900'
          }`}
        />
      </div>
    </div>
  )

  return (
    <>
      <div 
        ref={triggerRef}
        className={`relative inline-block ${className}`}
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
      </div>
      
      {mounted && isVisible && createPortal(tooltipContent, document.body)}
    </>
  )
}