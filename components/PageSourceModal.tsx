'use client'

import { X } from 'lucide-react'
import { useEffect, useRef } from 'react'

interface PageSource {
  url: string;
  title: string;
  mentions: number;
}

interface PageSourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  keyword: string;
  pageSources: PageSource[];
}

export default function PageSourceModal({ isOpen, onClose, keyword, pageSources }: PageSourceModalProps) {
  const backdropMouseDownRef = useRef(false)

  useEffect(() => {
    if (isOpen) {
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      // Restore body scroll when modal is closed
      document.body.style.overflow = 'unset';
    }

    // Cleanup function to restore scroll on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const getRelativeUrl = (fullUrl: string) => {
    try {
      const url = new URL(fullUrl);
      return url.pathname === '/' ? '/' : url.pathname;
    } catch {
      return fullUrl.replace(/^https?:\/\/[^\/]+/, '') || '/';
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(66, 73, 156, 0.93)' }}
      onMouseDown={() => { backdropMouseDownRef.current = true }}
      onMouseUp={(e) => {
        if (backdropMouseDownRef.current && e.target === e.currentTarget) {
          onClose()
        }
        backdropMouseDownRef.current = false
      }}
    >
      <div
        className="bg-white rounded-lg shadow-2xl border border-gray-200 w-full max-w-2xl max-h-[80vh] overflow-hidden relative"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              &quot;{keyword}&quot;
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {pageSources.length} location{pageSources.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[50vh] overflow-y-auto">
          {pageSources.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {/* Table Header */}
              <div className="bg-gray-50 px-6 py-3">
                <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-700">
                  <div className="col-span-6">Title</div>
                  <div className="col-span-4">URL</div>
                  <div className="col-span-2 text-center">Mentions</div>
                </div>
              </div>

              {/* Table Rows */}
              {pageSources.map((pageSource, index) => (
                <div key={index} className="px-6 py-4 hover:bg-gray-50">
                  <div className="grid grid-cols-12 gap-4 items-center text-sm">
                    <div className="col-span-6">
                      <span className="text-gray-900 font-medium">
                        {pageSource.title || 'Untitled Page'}
                      </span>
                    </div>
                    <div className="col-span-4">
                      <a 
                        href={pageSource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 hover:underline text-xs font-mono"
                      >
                        {getRelativeUrl(pageSource.url)}
                      </a>
                    </div>
                    <div className="col-span-2 text-center">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-600">
                        {pageSource.mentions}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-6 py-8 text-center text-gray-500">
              <p>No page sources available for this keyword.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <div>
              Total mentions: {pageSources.reduce((sum, page) => sum + page.mentions, 0)}
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}