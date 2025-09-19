"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { LoadingSpinner } from "@/components/LoadingSpinner"
import { ExternalLink, ZoomIn, ZoomOut, Download, RotateCcw, Maximize2 } from 'lucide-react'
import dynamic from 'next/dynamic'

interface DiscoveredPage {
  url: string;
  title: string;
  description?: string;
  lastModified?: string;
  source: 'sitemap' | 'internal-link' | 'homepage';
}

interface PageDiscoveryResult {
  pages: DiscoveredPage[];
  totalFound: number;
  sources: {
    sitemap: number;
    internalLinks: number;
    homepage: number;
  };
}

interface SitemapNode {
  id: string;
  label: string;
  url: string;
  level: number;
  children: SitemapNode[];
  source: string;
  lastModified?: string;
}

// Client-side only sitemap content to avoid hydration issues
function SitemapContent({ domain }: { domain: string }) {
  console.log('SitemapContent rendered with domain:', domain)
  
  const [sitemapData, setSitemapData] = useState<PageDiscoveryResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [sitemapTree, setSitemapTree] = useState<SitemapNode | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1); // Default to 100% zoom
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [lastPanOffset, setLastPanOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    console.log('=== SITEMAP CONTENT EFFECT RUNNING ===');
    console.log('Domain:', domain);
    
    if (domain) {
      console.log('Starting fetchSitemapData...');
      fetchSitemapData();
    } else {
      console.log('No domain provided');
      setError("No domain provided");
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [domain]);

  // Auto-fit sitemap to viewport when tree loads
  useEffect(() => {
    if (sitemapTree) {
      setTimeout(() => {
        autoFitSitemap();
      }, 100); // Small delay to ensure DOM is rendered
    }
  }, [sitemapTree]);

  const fetchSitemapData = async () => {
    console.log('=== FETCH SITEMAP DATA CALLED ===');
    console.log('Domain:', domain);
    
    if (!domain) {
      console.log('No domain, returning early');
      return;
    }
    
    try {
      console.log('Setting loading to true...');
      setIsLoading(true);
      setError("");

      console.log('Making API request to /api/discover-pages...');
      const response = await fetch('/api/discover-pages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: domain }),
      });

      console.log('API response received:', response.ok, response.status);

      if (!response.ok) {
        throw new Error('Failed to fetch sitemap data');
      }

      const data = await response.json();
      console.log('API data received:', data);
      setSitemapData(data);
      
      // Build hierarchical tree structure for flowchart view
      if (data.pages && data.pages.length > 0) {
        console.log('Building tree with pages:', data.pages.length);
        const tree = buildSitemapTree(data.pages, domain);
        console.log('Tree built:', tree);
        setSitemapTree(tree);
      } else {
        console.log('No pages data available for tree building');
      }
    } catch (err) {
      console.error('Error in fetchSitemapData:', err);
      setError(err instanceof Error ? err.message : 'Failed to load sitemap');
    } finally {
      console.log('Setting loading to false...');
      setIsLoading(false);
    }
  };

  // Build hierarchical tree structure from pages
  const buildSitemapTree = (pages: DiscoveredPage[], rootDomain: string): SitemapNode => {
    console.log('=== BUILDING SITEMAP TREE ===');
    console.log('Pages:', pages.length);
    console.log('Domain:', rootDomain);
    console.log('First page:', pages[0]);
    
    let rootUrl: URL;
    try {
      rootUrl = new URL(rootDomain);
      console.log('Root URL parsed successfully:', rootUrl.hostname);
    } catch (error) {
      console.error('Invalid rootDomain URL:', rootDomain, error);
      // Fallback
      rootUrl = new URL('https://example.com');
    }
    
    const root: SitemapNode = {
      id: 'root',
      label: rootUrl.hostname,
      url: rootDomain,
      level: 0,
      children: [],
      source: 'homepage'
    };
    
    console.log('Root node created:', root);

    console.log('Processing all pages for full tree structure...');

    // Create a map to track nodes by path
    const nodeMap = new Map<string, SitemapNode>();
    nodeMap.set('', root);

    // Sort pages by URL path length (shorter paths first)
    const sortedPages = [...pages].sort((a, b) => {
      const pathA = new URL(a.url).pathname;
      const pathB = new URL(b.url).pathname;
      return pathA.split('/').length - pathB.split('/').length;
    });

    console.log('Processing', sortedPages.length, 'sorted pages');
    
    for (const page of sortedPages) {
      try {
        const url = new URL(page.url);
        const pathname = url.pathname;
        
        // Normalize hostname to handle www/non-www variations
        const normalizedRootHostname = rootUrl.hostname.replace(/^www\./, '');
        const normalizedPageHostname = url.hostname.replace(/^www\./, '');
        
        console.log('Processing page:', page.url, 'pathname:', pathname);
        console.log('Hostnames - root:', normalizedRootHostname, 'page:', normalizedPageHostname);
        
        // Skip pages from different domains (after normalization)
        if (normalizedPageHostname !== normalizedRootHostname) {
          console.log('Skipping different domain:', page.url);
          continue;
        }
        
        // Skip root page (already added)
        if (pathname === '/' || pathname === '') {
          console.log('Skipping root page:', page.url);
          continue;
        }

        const pathParts = pathname.split('/').filter(Boolean);
        let currentPath = '';
        let parentNode = root;

        // Build intermediate nodes if needed
        for (let i = 0; i < pathParts.length; i++) {
          const part = pathParts[i];
          const isLast = i === pathParts.length - 1;
          currentPath += '/' + part;

          if (!nodeMap.has(currentPath)) {
            const newNode: SitemapNode = {
              id: currentPath,
              label: isLast ? page.title : part.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
              url: isLast ? page.url : rootDomain + currentPath,
              level: i + 1,
              children: [],
              source: isLast ? page.source : 'internal-link',
              lastModified: isLast ? page.lastModified : undefined
            };

            nodeMap.set(currentPath, newNode);
            parentNode.children.push(newNode);
          }

          parentNode = nodeMap.get(currentPath)!;
        }
      } catch (error) {
        console.warn('Error processing page:', page.url, error);
      }
    }

    return root;
  };

  // Render flowchart node
  const renderFlowchartNode = (node: SitemapNode, isRoot = false): JSX.Element => {
    const hasChildren = node.children.length > 0;
    
    return (
      <div key={node.id} className="flex flex-col items-center">
        {/* Node */}
        <div 
          className="group relative"
          onMouseDown={(e) => e.stopPropagation()}
          onMouseMove={(e) => e.stopPropagation()}
        >
          <div className={`
            px-3 py-2 rounded-lg border-2 transition-all duration-200 hover:shadow-lg cursor-pointer
            ${isRoot ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white hover:bg-gray-50'}
            max-w-[160px] text-center
          `}>
            <div className="flex items-center justify-center mb-1">
              <span className="font-medium text-sm truncate text-black" title={node.label}>
                {node.label}
              </span>
            </div>
            <div className="text-xs text-black truncate" title={node.url}>
              {new URL(node.url).pathname || '/'}
            </div>
            
            {/* Hover tooltip */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 whitespace-nowrap">
              <div className="font-medium">{node.label}</div>
              <div className="text-gray-300">{node.url}</div>
              {node.lastModified && (
                <div className="text-gray-400 text-xs">
                  Modified: {new Date(node.lastModified).toLocaleDateString()}
                </div>
              )}
              {/* Arrow */}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>

          {/* External link button */}
          <a
            href={node.url}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute -top-2 -right-2 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-700"
            title="Open in new tab"
          >
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Connection lines and children */}
        {hasChildren && (
          <div className="flex flex-col items-center mt-3">
            {/* Vertical line down */}
            <div className="w-0.5 bg-gray-300 h-4"></div>
            
            {/* Horizontal distribution line for multiple children */}
            {node.children.length > 1 && (
              <div className="relative">
                {/* Horizontal line */}
                <div className="h-0.5 bg-gray-300" style={{ 
                  width: isRoot ? '100%' : node.children.length > 8 ? '1000px' : node.children.length > 4 ? '800px' : `${Math.min(180 * node.children.length, 800)}px`
                }}></div>
                
                {/* Vertical lines to children */}
                <div className="flex justify-between absolute top-0" style={{ 
                  width: isRoot ? '100%' : node.children.length > 8 ? '1000px' : node.children.length > 4 ? '800px' : `${Math.min(180 * node.children.length, 800)}px`
                }}>
                  {node.children.map((_, index) => (
                    <div key={index} className="w-0.5 bg-gray-300 h-4"></div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Single child vertical line */}
            {node.children.length === 1 && (
              <div className="w-0.5 bg-gray-300 h-4"></div>
            )}

            {/* Child nodes */}
            <div className={`flex ${node.children.length > 1 ? 'justify-between' : 'justify-center'} mt-4 flex-wrap gap-4`}
                 style={{ 
                   width: isRoot ? '100%' : node.children.length > 8 ? '1000px' : node.children.length > 4 ? '800px' : `${Math.min(180 * node.children.length, 800)}px`
                 }}>
              {node.children.map(child => renderFlowchartNode(child))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.2, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.2, 0.3));
  };

  const handleZoomReset = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
    setLastPanOffset({ x: 0, y: 0 });
  };

  // Auto-fit sitemap to viewport
  const autoFitSitemap = () => {
    const container = document.getElementById('sitemap-viewport');
    const content = document.getElementById('sitemap-container');
    
    if (!container || !content) return;

    const containerRect = container.getBoundingClientRect();
    const contentRect = content.getBoundingClientRect();
    
    // Calculate the scale needed to fit both width and height with some padding
    const padding = 40; // 40px padding on all sides
    const scaleX = (containerRect.width - padding * 2) / contentRect.width;
    const scaleY = (containerRect.height - padding * 2) / contentRect.height;
    
    // Use the smaller scale to ensure it fits in both dimensions
    const autoScale = Math.min(scaleX, scaleY, 1); // Don't scale up beyond 100%
    
    if (autoScale < 1) {
      setZoomLevel(autoScale);
    }
    
    // Center the content
    setPanOffset({ x: 0, y: 0 });
    setLastPanOffset({ x: 0, y: 0 });
  };

  // Pan/drag functionality
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - panOffset.x,
      y: e.clientY - panOffset.y
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const newOffset = {
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    };
    setPanOffset(newOffset);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setLastPanOffset(panOffset);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const downloadPDF = async () => {
    if (!sitemapTree) return;
    
    // We'll implement PDF generation using html2canvas and jsPDF
    const element = document.getElementById('sitemap-container');
    if (!element) return;

    try {
      // Import dynamically to reduce bundle size
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).jsPDF;

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      const pdf = new jsPDF('p', 'mm', 'a4');
      let position = 0;

      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const hostname = domain ? new URL(domain).hostname : 'sitemap';
      pdf.save(`${hostname}-sitemap-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  if (!domain) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600">No domain provided in URL parameters.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Sitemap</h1>
                <p className="text-sm text-gray-600">{domain ? new URL(domain).hostname : ''}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Zoom Controls */}
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={handleZoomOut}
                  className="p-2 text-gray-600 hover:bg-gray-200 rounded transition-colors"
                  title="Zoom Out"
                  disabled={zoomLevel <= 0.3}
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="px-3 py-2 text-sm font-medium text-gray-700 min-w-[60px] text-center">
                  {Math.round(zoomLevel * 100)}%
                </span>
                <button
                  onClick={handleZoomIn}
                  className="p-2 text-gray-600 hover:bg-gray-200 rounded transition-colors"
                  title="Zoom In"
                  disabled={zoomLevel >= 3}
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  onClick={handleZoomReset}
                  className="p-2 text-gray-600 hover:bg-gray-200 rounded transition-colors ml-1"
                  title="Reset Zoom"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  onClick={autoFitSitemap}
                  className="p-2 text-gray-600 hover:bg-gray-200 rounded transition-colors"
                  title="Fit to Screen"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>

              {/* PDF Download */}
              <button
                onClick={downloadPDF}
                disabled={!sitemapTree || isLoading}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                title="Download PDF"
              >
                <Download className="w-4 h-4" />
                <span>Download PDF</span>
              </button>
            </div>
          </div>
          
          {/* Stats */}
          {sitemapData && (
            <div className="mt-4 text-center">
              <div className="inline-flex items-center px-4 py-2 bg-blue-50 rounded-lg">
                <span className="text-2xl font-bold text-blue-600 mr-2">{sitemapData.totalFound}</span>
                <span className="text-sm text-gray-600">Total Pages Discovered</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4">
        
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <LoadingSpinner size="lg" />
              <p className="text-gray-600 mt-4">Discovering pages...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={fetchSitemapData}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Retry
              </button>
            </div>
          </div>
        ) : sitemapData ? (
          sitemapTree ? (
            <div 
              id="sitemap-viewport"
              className="w-full overflow-visible relative"
              style={{ 
                cursor: isDragging ? 'grabbing' : 'grab',
                minHeight: 'calc(100vh - 200px)' // Full viewport minus header
              }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeave}
            >
              <div 
                id="sitemap-container"
                className="w-full flex justify-start py-8"
                style={{ 
                  transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
                  transformOrigin: 'top left'
                }}
              >
                <div className="inline-block">
                  {renderFlowchartNode(sitemapTree, true)}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="text-center">
                <LoadingSpinner size="lg" />
                <p className="text-gray-600 mt-4">Building sitemap visualization...</p>
              </div>
            </div>
          )
        ) : (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center text-gray-500">
              No sitemap data available.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Create a dynamic import for the sitemap content to avoid hydration issues
const DynamicSitemapContent = dynamic(() => Promise.resolve(SitemapContent), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="text-gray-600 mt-4">Loading sitemap...</p>
      </div>
    </div>
  )
})

export default function SitemapPage() {
  const searchParams = useSearchParams()
  const domain = searchParams.get('domain')
  
  console.log('Main SitemapPage rendered with domain:', domain)

  if (!domain) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600">No domain provided in URL parameters.</p>
        </div>
      </div>
    );
  }

  return <DynamicSitemapContent domain={domain} />
}