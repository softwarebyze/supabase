import { StripeSubscription } from 'components/interfaces/Billing'

export const getActiveAddOns = (subscription: StripeSubscription) => {
  const computeSize = subscription.addons.find((addon) =>
    addon.supabase_prod_id.includes('_instance_')
  )
  const pitrDuration = subscription.addons.find((addon) =>
    addon.supabase_prod_id.includes('_pitr_')
  )
  const customDomains = subscription.addons.find((addon) =>
    addon.supabase_prod_id.includes('_custom_domains')
  )
  return { computeSize, pitrDuration, customDomains }
}
