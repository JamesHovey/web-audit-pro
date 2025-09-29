"use client"

import { useState, useEffect, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { LoadingSpinner } from "@/components/LoadingSpinner"
import { ExternalLink, ZoomIn, ZoomOut, Download, RotateCcw, Maximize2, ChevronDown, ChevronRight, Move } from 'lucide-react'
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
  position?: { x: number; y: number };
  isExpanded?: boolean;
}

// Client-side only sitemap content to avoid hydration issues
function SitemapContent({ domain }: { domain: string }) {
  const [sitemapData, setSitemapData] = useState<PageDiscoveryResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [sitemapTree, setSitemapTree] = useState<SitemapNode | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const [nodePositions, setNodePositions] = useState<Map<string, { x: number; y: number }>>(new Map());
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['root']));
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (domain) {
      fetchSitemapData();
    } else {
      setError("No domain provided");
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [domain]);

  // Auto-fit sitemap to viewport when tree loads
  useEffect(() => {
    if (sitemapTree) {
      setTimeout(() => {
        centerAndFitSitemap();
        // Initialize all nodes as expanded
        const allNodeIds = getAllNodeIds(sitemapTree);
        setExpandedNodes(new Set(allNodeIds));
      }, 100);
    }
  }, [sitemapTree]);

  const getAllNodeIds = (node: SitemapNode): string[] => {
    const ids = [node.id];
    node.children.forEach(child => {
      ids.push(...getAllNodeIds(child));
    });
    return ids;
  };

  const fetchSitemapData = async () => {
    if (!domain) return;
    
    try {
      setIsLoading(true);
      setError("");

      const response = await fetch('/api/discover-pages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: domain }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch sitemap data');
      }

      const data = await response.json();
      setSitemapData(data);
      
      // Build hierarchical tree structure
      if (data.pages && data.pages.length > 0) {
        const tree = buildSitemapTree(data.pages, domain);
        setSitemapTree(tree);
        initializeNodePositions(tree);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sitemap');
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize grid positions for nodes
  const initializeNodePositions = (root: SitemapNode) => {
    const positions = new Map<string, { x: number; y: number }>();
    
    // Level 1 (parent pages) - arrange in grid
    const level1Nodes = root.children;
    const gridCols = Math.ceil(Math.sqrt(level1Nodes.length));
    const gridRows = Math.ceil(level1Nodes.length / gridCols);
    
    // Calculate total grid dimensions with more spacing for full screen
    const nodeWidth = 300; // Width including spacing
    const nodeHeight = 250; // Height including spacing
    const totalGridWidth = gridCols * nodeWidth;
    const totalGridHeight = gridRows * nodeHeight;
    
    // Center the grid by starting from negative offset
    const startX = -totalGridWidth / 2 + nodeWidth / 2;
    const startY = 100; // Start below the root node
    
    level1Nodes.forEach((node, index) => {
      const row = Math.floor(index / gridCols);
      const col = index % gridCols;
      
      positions.set(node.id, {
        x: startX + col * nodeWidth,
        y: startY + row * nodeHeight
      });
    });
    
    setNodePositions(positions);
  };

  // Build hierarchical tree structure from pages
  const buildSitemapTree = (pages: DiscoveredPage[], rootDomain: string): SitemapNode => {
    let rootUrl: URL;
    try {
      rootUrl = new URL(rootDomain);
    } catch (error) {
      rootUrl = new URL('https://example.com');
    }
    
    const root: SitemapNode = {
      id: 'root',
      label: rootUrl.hostname,
      url: rootDomain,
      level: 0,
      children: [],
      source: 'homepage',
      isExpanded: true
    };

    // Create a map to track nodes by path
    const nodeMap = new Map<string, SitemapNode>();
    nodeMap.set('', root);

    // Sort pages by URL path length (shorter paths first)
    const sortedPages = [...pages].sort((a, b) => {
      const pathA = new URL(a.url).pathname;
      const pathB = new URL(b.url).pathname;
      return pathA.split('/').length - pathB.split('/').length;
    });
    
    for (const page of sortedPages) {
      try {
        const url = new URL(page.url);
        const pathname = url.pathname;
        
        // Normalize hostname to handle www/non-www variations
        const normalizedRootHostname = rootUrl.hostname.replace(/^www\./, '');
        const normalizedPageHostname = url.hostname.replace(/^www\./, '');
        
        // Skip pages from different domains
        if (normalizedPageHostname !== normalizedRootHostname) {
          continue;
        }
        
        // Skip root page (already added)
        if (pathname === '/' || pathname === '') {
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
              lastModified: isLast ? page.lastModified : undefined,
              isExpanded: true
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

  const toggleNodeExpansion = (nodeId: string) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  };

  const handleNodeDragStart = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    setDraggedNode(nodeId);
    const pos = nodePositions.get(nodeId) || { x: 0, y: 0 };
    setDragStart({
      x: e.clientX - pos.x,
      y: e.clientY - pos.y
    });
  };

  const handleNodeDrag = (e: React.MouseEvent) => {
    if (!draggedNode) return;
    
    const newPos = {
      x: (e.clientX - dragStart.x - panOffset.x) / zoomLevel,
      y: (e.clientY - dragStart.y - panOffset.y) / zoomLevel
    };
    
    setNodePositions(prev => {
      const newPositions = new Map(prev);
      newPositions.set(draggedNode, newPos);
      return newPositions;
    });
  };

  const handleNodeDragEnd = () => {
    setDraggedNode(null);
  };

  // Render grid-based node
  const renderGridNode = (node: SitemapNode, isRoot = false, parentPos?: { x: number; y: number }): JSX.Element => {
    const hasChildren = node.children.length > 0;
    const isExpanded = expandedNodes.has(node.id);
    const nodePos = nodePositions.get(node.id) || { x: 0, y: 0 };
    
    if (isRoot) {
      // Render root node at center top
      return (
        <div key={node.id} className="w-full">
          {/* Root Node */}
          <div className="flex justify-center mb-8">
            <div className="px-4 py-3 bg-blue-600 text-white rounded-lg shadow-lg font-semibold text-center">
              <div className="text-lg mb-1">{node.label}</div>
              <div className="text-xs opacity-90">{node.url}</div>
            </div>
          </div>

          {/* Render Level 1 nodes in grid */}
          <div className="relative">
            {node.children.map(child => renderGridNode(child, false, { x: 0, y: 100 }))}
          </div>
        </div>
      );
    }

    return (
      <div key={node.id}>
        {/* Parent Node (draggable) */}
        <div
          className="absolute group"
          style={{
            left: `50%`,
            top: `${nodePos.y}px`,
            transform: `translateX(calc(-50% + ${nodePos.x}px))`,
            cursor: draggedNode === node.id ? 'grabbing' : 'move'
          }}
          onMouseDown={(e) => handleNodeDragStart(e, node.id)}
        >
          <div className="relative">
            <div className={`
              px-4 py-3 rounded-lg border-2 shadow-lg transition-all duration-200
              ${node.level === 1 ? 'border-blue-400 bg-blue-50' : 'border-gray-300 bg-white'}
              min-w-[220px] max-w-[280px]
            `}>
              {/* Drag handle indicator */}
              {node.level === 1 && (
                <Move className="absolute -top-2 -right-2 w-5 h-5 text-gray-400 bg-white rounded-full border p-0.5" />
              )}
              
              {/* Toggle button for children */}
              {hasChildren && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleNodeExpansion(node.id);
                  }}
                  className="absolute -left-3 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-white border-2 border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-50"
                >
                  {isExpanded ? (
                    <ChevronDown className="w-3 h-3 text-gray-600" />
                  ) : (
                    <ChevronRight className="w-3 h-3 text-gray-600" />
                  )}
                </button>
              )}
              
              <div className="flex items-center justify-between">
                <div className="flex-1 mr-2">
                  <div className="font-medium text-sm text-black truncate" title={node.label}>
                    {node.label}
                  </div>
                  <div className="text-xs text-gray-600 truncate" title={node.url}>
                    {new URL(node.url).pathname || '/'}
                  </div>
                  {hasChildren && (
                    <div className="text-xs text-gray-500 mt-1">
                      {node.children.length} {node.children.length === 1 ? 'page' : 'pages'}
                    </div>
                  )}
                </div>
                
                {/* External link */}
                <a
                  href={node.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                  title="Open in new tab"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Render children below if expanded */}
            {hasChildren && isExpanded && (
              <div className="mt-4 ml-8">
                {node.children.map((child, index) => (
                  <div
                    key={child.id}
                    className="relative mb-2 pl-4 border-l-2 border-gray-200"
                  >
                    {/* Connection line */}
                    <div className="absolute -left-[2px] top-3 w-4 h-0.5 bg-gray-200"></div>
                    
                    {/* Child node */}
                    <div className="inline-block px-2 py-1 bg-white border border-gray-200 rounded text-sm hover:bg-gray-50">
                      <div className="flex items-center space-x-2">
                        <span className="text-black truncate max-w-[200px]" title={child.url}>
                          {new URL(child.url).pathname || '/'}
                        </span>
                        <a
                          href={child.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:text-blue-700"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                    
                    {/* Recursively render grandchildren */}
                    {child.children.length > 0 && isExpanded && (
                      <div className="ml-4 mt-2">
                        {renderGridNode(child, false, nodePos)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
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
  };

  // Center and fit sitemap to viewport
  const centerAndFitSitemap = () => {
    const container = document.getElementById('sitemap-viewport');
    const content = document.getElementById('sitemap-container');
    
    if (!container || !content) return;

    const containerRect = container.getBoundingClientRect();
    
    // Reset zoom and pan first
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
    
    // Wait for DOM update, then measure actual content
    setTimeout(() => {
      const actualContent = content.querySelector('div'); // Get the actual sitemap content
      if (!actualContent) return;
      
      const contentRect = actualContent.getBoundingClientRect();
      const padding = 60; // More padding for better visibility
      
      // Calculate if we need to scale down to fit
      const scaleX = (containerRect.width - padding * 2) / contentRect.width;
      const scaleY = (containerRect.height - padding * 2) / contentRect.height;
      const autoScale = Math.min(scaleX, scaleY, 1); // Don't scale up beyond 100%
      
      if (autoScale < 1) {
        setZoomLevel(autoScale);
        // Center after scaling
        setTimeout(() => {
          centerSitemap(autoScale);
        }, 50);
      } else {
        // If it fits at 100%, just center it
        centerSitemap(1);
      }
    }, 50);
  };

  // Center the sitemap in the viewport
  const centerSitemap = (currentZoom: number = zoomLevel) => {
    const container = document.getElementById('sitemap-viewport');
    const content = document.getElementById('sitemap-container');
    
    if (!container || !content) return;
    
    const containerRect = container.getBoundingClientRect();
    const actualContent = content.querySelector('div');
    
    if (!actualContent) return;
    
    const contentRect = actualContent.getBoundingClientRect();
    
    // Calculate center position
    const centerX = (containerRect.width - contentRect.width * currentZoom) / 2;
    const centerY = (containerRect.height - contentRect.height * currentZoom) / 2;
    
    setPanOffset({
      x: Math.max(0, centerX), // Don't allow negative offset that would push content off-screen
      y: Math.max(0, centerY)
    });
  };

  // Legacy auto-fit function for the fit button
  const autoFitSitemap = () => {
    centerAndFitSitemap();
  };

  // Pan functionality
  const handlePanStart = (e: React.MouseEvent) => {
    if (draggedNode) return;
    setIsDragging(true);
    setDragStart({
      x: e.clientX - panOffset.x,
      y: e.clientY - panOffset.y
    });
  };

  const handlePanMove = (e: React.MouseEvent) => {
    if (!isDragging || draggedNode) return;
    
    const newOffset = {
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    };
    setPanOffset(newOffset);
  };

  const handlePanEnd = () => {
    if (!draggedNode) {
      setIsDragging(false);
    }
  };

  const downloadPDF = async () => {
    if (!sitemapTree) return;
    
    const element = document.getElementById('sitemap-container');
    if (!element) return;

    try {
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).jsPDF;

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      const imgWidth = 210;
      const pageHeight = 295;
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
    <div className="bg-gray-50 h-screen overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Interactive Sitemap</h1>
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
              >
                <Download className="w-4 h-4" />
                <span>Download PDF</span>
              </button>
            </div>
          </div>
          
          {/* Stats */}
          {sitemapData && (
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                <span className="font-semibold">{sitemapData.totalFound}</span> pages discovered
                • Drag parent pages to reorganize
                • Click arrows to expand/collapse
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
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
      ) : sitemapData && sitemapTree ? (
        <div 
          id="sitemap-viewport"
          className="fixed inset-0 overflow-hidden"
          style={{ 
            cursor: isDragging && !draggedNode ? 'grabbing' : 'grab',
            top: '140px', // Account for header
            left: '0',
            right: '0',
            bottom: '0'
          }}
          onMouseDown={handlePanStart}
          onMouseMove={(e) => {
            handlePanMove(e);
            handleNodeDrag(e);
          }}
          onMouseUp={() => {
            handlePanEnd();
            handleNodeDragEnd();
          }}
          onMouseLeave={() => {
            handlePanEnd();
            handleNodeDragEnd();
          }}
        >
          <div 
            id="sitemap-container"
            className="relative flex justify-center"
            style={{ 
              transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
              transformOrigin: 'center top',
              width: '100%',
              minHeight: '100%',
              paddingTop: '20px'
            }}
          >
            {renderGridNode(sitemapTree, true)}
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center text-gray-500">
            No sitemap data available.
          </div>
        </div>
      )}
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