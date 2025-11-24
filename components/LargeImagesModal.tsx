'use client'

import { useState, useRef } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import Tooltip from './Tooltip'

interface LargeImage {
  imageUrl: string
  pageUrl: string
  sizeKB: number
}

interface LargeImagesModalProps {
  isOpen: boolean
  onClose: () => void
  images: LargeImage[]
  totalSavings?: string
}

const ITEMS_PER_PAGE = 10

export default function LargeImagesModal({
  isOpen,
  onClose,
  images,
  totalSavings
}: LargeImagesModalProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const backdropMouseDownRef = useRef(false)

  if (!isOpen) return null

  const totalPages = Math.ceil(images.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const currentImages = images.slice(startIndex, endIndex)

  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(1, prev - 1))
  }

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(totalPages, prev + 1))
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(66, 73, 156, 0.93)', padding: '40px' }}
      onMouseDown={() => { backdropMouseDownRef.current = true }}
      onMouseUp={(e) => {
        if (backdropMouseDownRef.current && e.target === e.currentTarget) {
          onClose()
        }
        backdropMouseDownRef.current = false
      }}
    >
      <div
        className="bg-white rounded-lg shadow-xl flex flex-col"
        style={{ width: '100%', maxWidth: '1200px', maxHeight: '100%' }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-black text-white p-4 flex items-center justify-between rounded-t-lg flex-shrink-0">
          <div>
            <h3 className="text-xl font-bold" style={{ color: 'white' }}>Large Images Need Optimisation</h3>
            <p className="text-sm text-blue-100">{images.length} images over 100KB detected</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 flex-shrink-0">
          <div className="bg-orange-50 border border-orange-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-orange-100">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-orange-800">Image</th>
                    <th className="px-4 py-3 text-left font-medium text-orange-800">Found On Page</th>
                    <th className="px-4 py-3 text-right font-medium text-orange-800">Size</th>
                    <th className="px-4 py-3 text-left font-medium text-orange-800">Action Needed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-orange-200">
                  {currentImages.map((image, index) => (
                    <tr key={startIndex + index} className="hover:bg-orange-50">
                      <td className="px-4 py-3">
                        <a
                          href={image.imageUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 underline break-all"
                        >
                          {image.imageUrl.split('/').pop() || image.imageUrl}
                        </a>
                      </td>
                      <td className="px-4 py-3">
                        <Tooltip content={image.pageUrl}>
                          <a
                            href={image.pageUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 underline"
                          >
                            {image.pageUrl.replace(/^https?:\/\//, '').substring(0, 50)}...
                          </a>
                        </Tooltip>
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-red-600">
                        {(image.sizeKB || 0).toLocaleString()}KB
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {image.sizeKB > 500 ? 'Optimize urgently' : 'Compress image'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="border-t border-orange-200 bg-orange-50 p-4 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing {startIndex + 1}-{Math.min(endIndex, images.length)} of {images.length} images
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 rounded flex items-center gap-1 text-sm ${
                      currentPage === 1
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </button>
                  <span className="text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1 rounded flex items-center gap-1 text-sm ${
                      currentPage === totalPages
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        {totalSavings && (
          <div className="border-t border-gray-200 p-4 bg-gray-50 flex-shrink-0">
            <p className="text-sm text-gray-600">
              Potential savings: <span className="font-semibold text-green-600">{totalSavings}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
