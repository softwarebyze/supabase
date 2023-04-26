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
import { BILLING_BREAKDOWN_METRICS } from './Subscription.constants'
import clsx from 'clsx'
import { formatBytes } from 'lib/helpers'
import { getActiveAddOns } from './Subscription.utils'

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
  const totalUpcomingCost = 0

  return (
    <div className="grid grid-cols-12">
      <div className="col-span-5">
        <p className="text-base">Billing breakdown</p>
        <p className="text-sm text-scale-1000">Some description text here</p>
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

                if (!usageMeta.available_in_plan) return null

                return (
                  <div
                    key={metric.key}
                    className={clsx(
                      'col-span-6 py-4 space-y-4',
                      i % 2 === 0 ? 'border-r pr-4' : 'pl-4',
                      i < BILLING_BREAKDOWN_METRICS.length - 2 && 'border-b'
                    )}
                  >
                    <p className="text-sm text-scale-1100">{metric.name}</p>
                    <SparkBar
                      type="horizontal"
                      max={usageMeta.limit}
                      value={0}
                      barClass="bg-scale-1100"
                      labelBottom={usageLabel}
                      labelBottomClass="!text-scale-1000"
                      labelTop={percentageLabel}
                    />
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
              <tr className="border-b">
                <td className="py-2 text-sm">{subscription?.tier.name}</td>
                <td className="py-2 text-sm">1</td>
                <td className="py-2 text-sm">${subscription?.tier.unit_amount ?? 0}</td>
                <td className="py-2 text-sm text-right">${subscription?.tier.unit_amount ?? 0}</td>
              </tr>
              {/* Compute */}
              {activeAddons?.computeSize !== undefined ? (
                <tr className="border-b">
                  <td className="py-2 text-sm">{activeAddons.computeSize.name}</td>
                  <td className="py-2 text-sm">1</td>
                  <td className="py-2 text-sm">${activeAddons.computeSize.unit_amount}</td>
                  <td className="py-2 text-sm text-right">
                    ${activeAddons.computeSize.unit_amount}
                  </td>
                </tr>
              ) : (
                <tr className="border-b">
                  <td className="py-2 text-sm">Micro compute</td>
                  <td className="py-2 text-sm">1</td>
                  <td className="py-2 text-sm">$0</td>
                  <td className="py-2 text-sm text-right">0</td>
                </tr>
              )}
              {/* Need to add other line items here */}
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
