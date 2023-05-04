import { LogsEndpointParams } from 'components/interfaces/Settings/Logs'

export const analyticsKeys = {
  functionsInvStats: (
    projectRef: string | undefined,
    { interval, functionId }: { functionId: string | undefined; interval: string | undefined }
  ) => ['projects', projectRef, 'functions-inv-stats', { interval, functionId }] as const,

  usageApiCounts: (projectRef: string | undefined, interval: string | undefined) =>
    ['projects', projectRef, 'usage.api-counts', interval] as const,
}

