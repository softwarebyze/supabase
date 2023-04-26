import { useQuery, useQueryClient, UseQueryOptions } from '@tanstack/react-query'
import { get } from 'lib/common/fetch'
import { API_URL } from 'lib/constants'
import { useCallback } from 'react'
import { usageKeys } from './keys'

export type ProjectUsageVariables = {
  projectRef?: string
}

export interface UsageMetadata {
  usage: number | null
  limit: number
  cost: number
  available_in_plan: boolean
  // [Joshen] can we verify if this is still getting passed?
  // Only for database and storage size
  current?: number
}

export type ProjectUsageResponse = {
  db_size: UsageMetadata
  db_egress: UsageMetadata
  disk_volume_size_gb: number

  storage_size: UsageMetadata
  storage_egress: UsageMetadata
  storage_image_render_count: UsageMetadata

  monthly_active_users: UsageMetadata

  func_count: UsageMetadata
  func_invocations: UsageMetadata

  realtime_message_count: UsageMetadata
  realtime_peak_connection: UsageMetadata
}

export type ProjectUsageResponseUsageKeys = keyof Omit<ProjectUsageResponse, 'disk_volume_size_gb'>

export async function getProjectUsage({ projectRef }: ProjectUsageVariables, signal?: AbortSignal) {
  if (!projectRef) {
    throw new Error('projectRef is required')
  }

  const response = await get(`${API_URL}/projects/${projectRef}/usage`, {
    signal,
  })
  if (response.error) {
    throw response.error
  }

  return response as ProjectUsageResponse
}

export type ProjectUsageData = Awaited<ReturnType<typeof getProjectUsage>>
export type ProjectUsageError = unknown

export const useProjectUsageQuery = <TData = ProjectUsageData>(
  { projectRef }: ProjectUsageVariables,
  { enabled = true, ...options }: UseQueryOptions<ProjectUsageData, ProjectUsageError, TData> = {}
) =>
  useQuery<ProjectUsageData, ProjectUsageError, TData>(
    usageKeys.usage(projectRef),
    ({ signal }) => getProjectUsage({ projectRef }, signal),
    {
      enabled: enabled && typeof projectRef !== 'undefined',
      ...options,
    }
  )

export const useProjectUsagePrefetch = ({ projectRef }: ProjectUsageVariables) => {
  const client = useQueryClient()

  return useCallback(() => {
    if (projectRef) {
      client.prefetchQuery(usageKeys.usage(projectRef), ({ signal }) =>
        getProjectUsage({ projectRef }, signal)
      )
    }
  }, [projectRef])
}
