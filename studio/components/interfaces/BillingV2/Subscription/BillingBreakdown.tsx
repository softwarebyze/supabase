import clsx from 'clsx'
import { useParams } from 'common'
import ShimmeringLoader from 'components/ui/ShimmeringLoader'
import SparkBar from 'components/ui/SparkBar'
import { useProjectSubscriptionQuery } from 'data/subscriptions/project-subscription-query'
import {
  ProjectUsageResponse,
  UsageMetadata,
  useProjectUsageQuery,
} from 'data/usage/project-usage-query'
import dayjs from 'dayjs'
import { formatBytes } from 'lib/helpers'
import BillingBreakdownRow from './BillingBreakdownRow'
import { BILLING_BREAKDOWN_METRICS } from './Subscription.constants'
import { getActiveAddOns } from './Subscription.utils'
import { USAGE_APPROACHING_THRESHOLD } from 'lib/constants'
import { IconAlertTriangle } from 'ui'

export interface BillingBreakdownProps {}

const BillingBreakdown = ({}: BillingBreakdownProps) => {
  const { ref: projectRef } = useParams()
  const { data: usage, isLoading: isLoadingUsage } = useProjectUsageQuery({ projectRef })
  const { data: subscription, isLoading: isLoadingSubscription } = useProjectSubscriptionQuery({
    projectRef,
  })
  const activeAddons = subscription !== undefined ? getActiveAddOns(subscription) : undefined
  const billingCycleStart = dayjs.unix(subscription?.billing?.current_period_start ?? 0).utc()
  const billingCycleEnd = dayjs.unix(subscription?.billing?.current_period_end ?? 0).utc()

  // [Joshen] To be derived dynamically
  const tierCost = (subscription?.tier.unit_amount ?? 0) / 100
  const addOnsCost =
    activeAddons !== undefined
      ? Object.values(activeAddons)
          .map((value) => value?.unit_amount ?? 0)
          .reduce((a, b) => a + b, 0) / 100
      : 0
  const totalUpcomingCost = tierCost + addOnsCost

  return (
    <div className="grid grid-cols-12">
      <div className="col-span-5">
        <div className="sticky top-16">
          <p className="text-base">Billing breakdown</p>
          <p className="text-sm text-scale-1000">Some description text here</p>
        </div>
      </div>
      {isLoadingSubscription ? (
        <div className="col-span-7 space-y-2">
          <ShimmeringLoader />
          <ShimmeringLoader className="w-3/4" />
          <ShimmeringLoader className="w-1/2" />
        </div>
      ) : (
        <div className="col-span-7 space-y-6">
          <p className="text-sm">Included usage summary</p>
          <p className="text-sm text-scale-1000">
            Your plan includes a limited amount of included usage. If the usage on your project
            exceeds these quotas, your subscription will be charged for the extra usage.
            Organization owners are notified each time your project approaches or exceeds the
            included usage. Learn more
          </p>
          <p className="text-sm text-scale-1000">
            Current billing cycle: {billingCycleStart.format('MMM DD')} -{' '}
            {billingCycleEnd.format('MMM DD')}
          </p>

          {isLoadingUsage ? (
            <div className="col-span-7 space-y-2">
              <ShimmeringLoader />
              <ShimmeringLoader className="w-3/4" />
              <ShimmeringLoader className="w-1/2" />
            </div>
          ) : (
            <div className="grid grid-cols-12">
              {BILLING_BREAKDOWN_METRICS.map((metric, i) => {
                const usageMeta =
                  (usage?.[metric.key as keyof ProjectUsageResponse] as UsageMetadata) ?? undefined
                const usageRatio =
                  typeof usageMeta !== 'number'
                    ? (usageMeta?.usage ?? 0) / (usageMeta?.limit ?? 0)
                    : 0

                const usageCurrentLabel =
                  metric.units === 'bytes'
                    ? formatBytes(usageMeta.usage)
                    : usageMeta.usage?.toLocaleString()
                const usageLimitLabel =
                  metric.units === 'bytes'
                    ? formatBytes(usageMeta.limit)
                    : usageMeta.limit.toLocaleString()
                const usageLabel = `${usageCurrentLabel} of ${usageLimitLabel}`
                const percentageLabel = `${(usageRatio * 100).toFixed(2)}%`

                const isApproachingLimit = usageRatio >= USAGE_APPROACHING_THRESHOLD
                const isExceededLimit = usageRatio >= 1

                return (
                  <div
                    key={metric.key}
                    className={clsx(
                      'col-span-6 py-4 space-y-4 border-scale-400',
                      i % 2 === 0 ? 'border-r pr-4' : 'pl-4',
                      i < BILLING_BREAKDOWN_METRICS.length - 2 && 'border-b'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-scale-1100">{metric.name}</p>
                      {isExceededLimit ? (
                        <div className="flex items-center space-x-2 min-w-[115px]">
                          <IconAlertTriangle size={14} strokeWidth={2} className="text-red-900" />
                          <p className="text-sm text-red-900">Exceeded limit</p>
                        </div>
                      ) : isApproachingLimit ? (
                        <div className="flex items-center space-x-2 min-w-[115px]">
                          <IconAlertTriangle size={14} strokeWidth={2} className="text-amber-900" />
                          <p className="text-sm text-amber-900">Reaching limit</p>
                        </div>
                      ) : null}
                    </div>
                    {usageMeta.available_in_plan ? (
                      <SparkBar
                        type="horizontal"
                        max={usageMeta.limit}
                        value={usageMeta.usage ?? 0}
                        barClass={
                          isExceededLimit
                            ? 'bg-red-900'
                            : isApproachingLimit
                            ? 'bg-amber-900'
                            : 'bg-scale-1100'
                        }
                        labelBottom={usageLabel}
                        labelBottomClass="!text-scale-1000"
                        labelTop={percentageLabel}
                        labelTopClass={
                          isExceededLimit
                            ? '!text-red-900'
                            : isApproachingLimit
                            ? '!text-amber-900'
                            : ''
                        }
                      />
                    ) : (
                      // [Joshen] Needs a better CTA here
                      <p className="text-sm text-scale-1100">Unavailable in your plan</p>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          <p className="!mt-10 text-sm">Upcoming cost for next invoice</p>
          <p className="text-sm text-scale-1000">
            Your plan includes a limited amount of included usage. If the usage on your project
            exceeds these quotas, your subscription will be charged for the extra usage.
            Organization owners are notified each time your project approaches or exceeds the
            included usage. Learn more
          </p>
          <p className="text-sm text-scale-1000">
            Current billing cycle: {billingCycleStart.format('MMM DD')} -{' '}
            {billingCycleEnd.format('MMM DD')}
          </p>

          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="py-2 font-normal text-left text-sm text-scale-1000 w-1/2">Item</th>
                <th className="py-2 font-normal text-left text-sm text-scale-1000">Count</th>
                <th className="py-2 font-normal text-left text-sm text-scale-1000">Unit price</th>
                <th className="py-2 font-normal text-right text-sm text-scale-1000">Price</th>
              </tr>
            </thead>
            <tbody>
              {/* Tier */}
              <BillingBreakdownRow name={subscription?.tier.name} cost={tierCost} />
              {/* Compute */}
              {activeAddons?.computeSize !== undefined ? (
                <BillingBreakdownRow
                  name={activeAddons.computeSize.name}
                  cost={activeAddons.computeSize.unit_amount / 100}
                />
              ) : (
                <BillingBreakdownRow name="Micro compute" cost={0} />
              )}
              {/* PITR */}
              {activeAddons?.pitrDuration !== undefined && (
                <BillingBreakdownRow
                  name="Point in time recovery"
                  cost={activeAddons.pitrDuration.unit_amount / 100}
                />
              )}
              {/* Custom domain */}
              {activeAddons?.customDomains !== undefined && (
                <BillingBreakdownRow
                  name="Custom domain"
                  cost={activeAddons.customDomains.unit_amount / 100}
                />
              )}
              {/* Total */}
              <tr>
                <td className="py-2 text-sm">Total</td>
                <td className="py-2 text-sm" />
                <td className="py-2 text-sm" />
                <td className="py-2 text-sm text-right">${totalUpcomingCost.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default BillingBreakdown
