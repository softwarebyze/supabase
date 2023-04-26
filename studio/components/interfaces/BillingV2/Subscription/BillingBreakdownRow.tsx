export interface BillingBreakdownRowProps {
  name?: string
  cost: number
}

const BillingBreakdownRow = ({ name, cost }: BillingBreakdownRowProps) => {
  return (
    <tr className="border-b">
      <td className="py-2 text-sm">{name ?? 'Unknown'}</td>
      <td className="py-2 text-sm">1</td>
      <td className="py-2 text-sm">{cost === 0 ? 'FREE' : `$${cost}`}</td>
      <td className="py-2 text-sm text-right">${cost}</td>
    </tr>
  )
}

export default BillingBreakdownRow
