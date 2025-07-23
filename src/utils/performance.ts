/**
 * Performance monitoring utilities for the Todo app
 */

/**
 * Performance metrics interface
 */
interface PerformanceMetrics {
  renderCount: number;
  lastRenderTime: number;
  averageRenderTime: number;
  totalRenderTime: number;
}

/**
 * Component performance tracker
 */
class ComponentPerformanceTracker {
  private metrics: Map<string, PerformanceMetrics> = new Map();

  /**
   * Start tracking a component render
   */
  startRender(componentName: string): () => void {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      this.recordRender(componentName, renderTime);
    };
  }

  /**
   * Record a component render time
   */
  private recordRender(componentName: string, renderTime: number): void {
    const existing = this.metrics.get(componentName) || {
      renderCount: 0,
      lastRenderTime: 0,
      averageRenderTime: 0,
      totalRenderTime: 0
    };

    const newMetrics: PerformanceMetrics = {
      renderCount: existing.renderCount + 1,
      lastRenderTime: renderTime,
      totalRenderTime: existing.totalRenderTime + renderTime,
      averageRenderTime: (existing.totalRenderTime + renderTime) / (existing.renderCount + 1)
    };

    this.metrics.set(componentName, newMetrics);
  }

  /**
   * Get metrics for a specific component
   */
  getMetrics(componentName: string): PerformanceMetrics | undefined {
    return this.metrics.get(componentName);
  }

  /**
   * Get all metrics
   */
  getAllMetrics(): Map<string, PerformanceMetrics> {
    return new Map(this.metrics);
  }

  /**
   * Clear metrics for a component
   */
  clearMetrics(componentName: string): void {
    this.metrics.delete(componentName);
  }

  /**
   * Clear all metrics
   */
  clearAllMetrics(): void {
    this.metrics.clear();
  }

  /**
   * Log performance summary to console
   */
  logSummary(): void {
    if (this.metrics.size === 0) {
      console.log('No performance metrics recorded');
      return;
    }

    console.group('Component Performance Summary');
    
    for (const [componentName, metrics] of this.metrics) {
      console.log(`${componentName}:`, {
        renders: metrics.renderCount,
        lastRender: `${metrics.lastRenderTime.toFixed(2)}ms`,
        avgRender: `${metrics.averageRenderTime.toFixed(2)}ms`,
        totalTime: `${metrics.totalRenderTime.toFixed(2)}ms`
      });
    }
    
    console.groupEnd();
  }
}

/**
 * Global performance tracker instance
 */
export const performanceTracker = new ComponentPerformanceTracker();

/**
 * React hook for tracking component render performance
 */
export function usePerformanceTracking(componentName: string): void {
  if (process.env.NODE_ENV === 'development') {
    const endTracking = performanceTracker.startRender(componentName);
    
    // Use useEffect to end tracking after render
    React.useEffect(() => {
      endTracking();
    });
  }
}

/**
 * Higher-order component for performance tracking
 */
export function withPerformanceTracking<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName?: string
): React.ComponentType<P> {
  const displayName = componentName || WrappedComponent.displayName || WrappedComponent.name || 'Component';
  
  const TrackedComponent = (props: P) => {
    if (process.env.NODE_ENV === 'development') {
      usePerformanceTracking(displayName);
    }
    
    return React.createElement(WrappedComponent, props);
  };
  
  TrackedComponent.displayName = `withPerformanceTracking(${displayName})`;
  
  return TrackedComponent;
}

/**
 * Debounce function for performance optimization
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

/**
 * Throttle function for performance optimization
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  
  return (...args: Parameters<T>) => {
    const now = Date.now();
    
    if (now - lastCall >= delay) {
      lastCall = now;
      func(...args);
    }
  };
}

/**
 * Memory usage monitoring
 */
export function logMemoryUsage(label?: string): void {
  if (process.env.NODE_ENV === 'development' && 'memory' in performance) {
    const memory = (performance as any).memory;
    console.log(`Memory Usage${label ? ` (${label})` : ''}:`, {
      used: `${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
      total: `${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
      limit: `${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB`
    });
  }
}

// Import React for the hook
import React from 'react';