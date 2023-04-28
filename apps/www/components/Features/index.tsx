import { Button, Badge, IconArrowRight } from 'ui'
import SectionHeader from 'components/UI/SectionHeader'
import Solutions from 'data/Solutions.json'
import Link from 'next/link'
import SectionContainer from '../Layouts/SectionContainer'
import ProductIcon from '../ProductIcon'
import TextLink from '../TextLink'
import { PropsWithChildren } from 'react'

const Card = ({
  classname,
  title,
  subtitle,
  image,
}: {
  title: string
  subtitle: string
  image: any
  classname?: string
}) => (
  <div
    className={[
      'col-span-1 lg:col-span-4 h-[400px] flex flex-col gap-5 lg:flex-row',
      classname,
    ].join(' ')}
  >
    <div
      className={`relative overflow-hidden group/2 flex-1 flex flex-col items-center gap-5 lg:items-start justify-between bg-slate-100
                  w-full border border-[#232323] rounded-xl h-full px-2 sm:px-6 py-14 shadow-lg`}
    >
      <div className="flex flex-col items-center mx-auto max-w-xs text-center gap-2 text-white">
        <h3 className="z-0 relative xs:text-2xl text-xl">{title}</h3>
        <p className="text-sm sm:text-base text-slate-1000">{subtitle}</p>
        {image}
      </div>
    </div>
  </div>
)

const Features = () => {
  return (
    <SectionContainer className="space-y-8 max-w-7xl pb-0 pt-0 md:!pt-0">
      <dl className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:gap-6 lg:grid-cols-6">
        <Card
          title={'PostgreSQL Database'}
          subtitle="Every project is a full Postgres database, the world's most trusted relational database."
          image={null}
        />
        <Card
          title={Solutions['authentication'].name}
          subtitle={Solutions['authentication'].description}
          image={null}
          classname="lg:!col-span-2"
        />
        <Card
          title={Solutions['storage'].name}
          subtitle={Solutions['storage'].description}
          image={null}
          classname="lg:!col-span-2"
        />
        <Card
          title={Solutions['edge-functions'].name}
          subtitle={Solutions['edge-functions'].description}
          image={null}
        />
      </dl>
    </SectionContainer>
  )
}

export default Features
