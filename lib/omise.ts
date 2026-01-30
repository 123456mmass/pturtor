import Omise from 'omise'

const omise = Omise({
  publicKey: process.env.OMISE_PUBLIC_KEY!,
  secretKey: process.env.OMISE_SECRET_KEY!,
})

export { omise }

export async function createOmiseCharge(
  amount: number, // in satang
  currency: string,
  sourceId: string,
  description: string,
  metadata: Record<string, string>
) {
  return await omise.charges.create({
    amount,
    currency,
    source: sourceId,
    description,
    metadata,
  })
}

export async function createOmiseSource(
  amount: number,
  currency: string,
  type: 'promptpay' | 'internet_banking' | 'alipay'
) {
  return await omise.sources.create({
    type,
    amount,
    currency,
  })
}

export async function retrieveCharge(chargeId: string) {
  return await omise.charges.retrieve(chargeId)
}
