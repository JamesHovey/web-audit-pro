'use client'

import { useState } from 'react'

interface CreditPackagesProps {
  markup?: number
}

// Base cost per credit (before markup) - 1p = £0.01
const BASE_COST_PER_CREDIT = 0.01

const calculatePrice = (credits: number, markup: number) => {
  // Calculate actual price with markup
  const costPerCredit = BASE_COST_PER_CREDIT
  const priceWithMarkup = credits * costPerCredit * (1 + markup / 100)

  // Convert to .99 format (subtract 1p and ensure minimum of 0.99)
  const priceNinetyNine = Math.max(0.99, Math.floor(priceWithMarkup) - 0.01)

  return priceNinetyNine
}

const formatPrice = (price: number) => {
  return `£${price.toFixed(2)}`
}

const formatPricePerCredit = (totalPrice: number, credits: number) => {
  const pricePerCredit = (totalPrice / credits) * 100
  return `${Math.round(pricePerCredit)}p / credit`
}

export default function CreditPackages({ markup = 100 }: CreditPackagesProps) {
  const [customCredits, setCustomCredits] = useState('')

  const packages = [
    {
      name: "Starter",
      credits: 100,
      features: [
        "100 audit credits",
        "~3-7 full-site audits",
        "All SEO features",
        "PDF exports",
        "Email support"
      ],
      popular: false
    },
    {
      name: "Professional",
      credits: 500,
      features: [
        "500 audit credits",
        "~15-35 full-site audits",
        "All SEO features",
        "PDF exports",
        "Priority support",
        "API access (coming soon)"
      ],
      popular: true
    },
    {
      name: "Business",
      credits: 2000,
      features: [
        "2,000 audit credits",
        "~60-140 full-site audits",
        "All SEO features",
        "PDF exports",
        "Priority support",
        "API access (coming soon)",
        "White-label reports"
      ],
      popular: false
    },
    {
      name: "Enterprise",
      credits: 10000,
      features: [
        "10,000 audit credits",
        "~300-700 full-site audits",
        "All SEO features",
        "PDF exports",
        "Dedicated support",
        "API access",
        "White-label reports",
        "Custom integrations"
      ],
      popular: false
    }
  ]

  // Calculate savings percentage dynamically
  const calculateSavings = (credits: number) => {
    const price = calculatePrice(credits, markup)
    const starterPrice = calculatePrice(100, markup)

    const pricePerCredit = price / credits
    const starterPricePerCredit = starterPrice / 100

    const savingsPercentage = ((starterPricePerCredit - pricePerCredit) / starterPricePerCredit) * 100

    return savingsPercentage > 0 ? Math.round(savingsPercentage) : 0
  }

  const customPrice = customCredits ? calculatePrice(parseInt(customCredits) || 0, markup) : 0

  return (
    <div className="w-full">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Credit Packages
        </h2>
        <p className="text-gray-600 text-sm">
          Purchase credits to run comprehensive SEO audits
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map((pkg) => {
            const price = calculatePrice(pkg.credits, markup)
            const pricePerCredit = formatPricePerCredit(price, pkg.credits)
            const savings = calculateSavings(pkg.credits)

            return (
              <div
                key={pkg.name}
                className={`relative bg-white rounded-lg border-2 p-5 transition-all hover:shadow-lg ${
                  pkg.popular
                    ? 'border-[#42499c] shadow-md'
                    : 'border-gray-200'
                }`}
              >
                {/* Coming Soon Ribbon */}
                <div className="absolute top-0 right-0 bg-amber-500 text-white text-xs font-bold px-2.5 py-0.5 rounded-bl-lg rounded-tr-lg">
                  COMING SOON
                </div>

                {pkg.popular && (
                  <div className="absolute -top-2.5 left-1/2 transform -translate-x-1/2 bg-[#42499c] text-white text-xs font-bold px-2.5 py-0.5 rounded-full whitespace-nowrap">
                    MOST POPULAR
                  </div>
                )}

                <div className="text-center mb-3 mt-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{pkg.name}</h3>
                  <div className="text-2xl font-bold text-[#42499c] mb-0.5">{formatPrice(price)}</div>
                  {savings > 0 && (
                    <div className="text-xs text-green-600 font-medium">{savings}% savings</div>
                  )}
                  <div className="text-xs text-gray-600">{pricePerCredit}</div>
                </div>

                <div className="text-center mb-3">
                  <div className="inline-flex items-center gap-1 bg-blue-50 text-[#42499c] px-2.5 py-1 rounded-full text-xs font-semibold">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                      <circle cx="10" cy="10" r="8" fill="currentColor" opacity="0.2"/>
                      <text x="10" y="13.5" textAnchor="middle" fontSize="10" fontWeight="bold" fill="currentColor">£</text>
                    </svg>
                    {pkg.credits.toLocaleString()} Credits
                  </div>
                </div>

                <ul className="space-y-1.5 mb-4 min-h-[140px]">
                  {pkg.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-1.5 text-xs text-gray-700">
                      <svg className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>

                <button
                  disabled
                  className="w-full bg-gray-100 text-gray-400 font-semibold py-2 px-4 rounded-lg cursor-not-allowed text-sm"
                >
                  Coming Soon
                </button>
              </div>
            )
          })}

          {/* Custom Package */}
          <div className="relative bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg border-2 border-purple-300 p-5 transition-all hover:shadow-lg">
            {/* Coming Soon Ribbon */}
            <div className="absolute top-0 right-0 bg-amber-500 text-white text-xs font-bold px-2.5 py-0.5 rounded-bl-lg rounded-tr-lg">
              COMING SOON
            </div>

            <div className="text-center mb-3 mt-1">
              <h3 className="text-lg font-bold text-gray-900 mb-1">Custom</h3>
              <div className="text-2xl font-bold text-purple-600 mb-0.5">
                {customCredits && parseInt(customCredits) > 0 ? formatPrice(customPrice) : '£--.--'}
              </div>
              {customCredits && parseInt(customCredits) > 0 && calculateSavings(parseInt(customCredits)) > 0 && (
                <div className="text-xs text-green-600 font-medium">
                  {calculateSavings(parseInt(customCredits))}% savings
                </div>
              )}
              <div className="text-xs text-gray-600">
                {customCredits && parseInt(customCredits) > 0
                  ? formatPricePerCredit(customPrice, parseInt(customCredits))
                  : '- / credit'}
              </div>
            </div>

            <div className="text-center mb-3">
              <div className="inline-flex items-center gap-1 bg-purple-100 text-purple-700 px-2.5 py-1 rounded-full text-xs font-semibold">
                <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                  <circle cx="10" cy="10" r="8" fill="currentColor" opacity="0.2"/>
                  <text x="10" y="13.5" textAnchor="middle" fontSize="10" fontWeight="bold" fill="currentColor">£</text>
                </svg>
                Custom Credits
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="customCredits" className="block text-sm font-medium text-gray-700 mb-2">
                Enter credits amount
              </label>
              <input
                type="number"
                id="customCredits"
                value={customCredits}
                onChange={(e) => setCustomCredits(e.target.value)}
                min="1"
                step="100"
                placeholder="e.g., 1000"
                className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
              />
            </div>

            <ul className="space-y-1.5 mb-4 min-h-[140px]">
              <li className="flex items-start gap-1.5 text-xs text-gray-700">
                <svg className="w-4 h-4 text-purple-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Choose your credit amount
              </li>
              <li className="flex items-start gap-1.5 text-xs text-gray-700">
                <svg className="w-4 h-4 text-purple-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                All SEO features
              </li>
              <li className="flex items-start gap-1.5 text-xs text-gray-700">
                <svg className="w-4 h-4 text-purple-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Flexible pricing
              </li>
              <li className="flex items-start gap-1.5 text-xs text-gray-700">
                <svg className="w-4 h-4 text-purple-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Perfect for any project size
              </li>
            </ul>

            <button
              disabled
              className="w-full bg-gray-100 text-gray-400 font-semibold py-2 px-4 rounded-lg cursor-not-allowed text-sm"
            >
              Coming Soon
            </button>
          </div>
      </div>

      {/* Stripe Badge */}
      <div className="mt-5 flex items-center justify-center gap-2 text-xs text-gray-600">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
          <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" fill="#42499c"/>
        </svg>
        <span>Secure payments powered by</span>
        <svg className="h-4" viewBox="0 0 60 25" fill="#6772E5">
          <path d="M59.64 14.28h-8.06c.19 1.93 1.6 2.55 3.2 2.55 1.64 0 2.96-.37 4.05-.95v3.32a8.33 8.33 0 0 1-4.56 1.1c-4.01 0-6.83-2.5-6.83-7.48 0-4.19 2.39-7.52 6.3-7.52 3.92 0 5.96 3.28 5.96 7.5 0 .4-.04 1.26-.06 1.48zm-5.92-5.62c-1.03 0-2.17.73-2.17 2.58h4.25c0-1.85-1.07-2.58-2.08-2.58zM40.95 20.3c-1.44 0-2.32-.6-2.9-1.04l-.02 4.63-4.12.87V5.57h3.76l.08 1.02a4.7 4.7 0 0 1 3.23-1.29c2.9 0 5.62 2.6 5.62 7.4 0 5.23-2.7 7.6-5.65 7.6zM40 8.95c-.95 0-1.54.34-1.97.81l.02 6.12c.4.44.98.78 1.95.78 1.52 0 2.54-1.65 2.54-3.87 0-2.15-1.04-3.84-2.54-3.84zM28.24 5.57h4.13v14.44h-4.13V5.57zm0-4.7L32.37 0v3.36l-4.13.88V.88zm-4.32 9.35v9.79H19.8V5.57h3.7l.12 1.22c1-1.77 3.07-1.41 3.62-1.22v3.79c-.52-.17-2.29-.43-3.32.86zm-8.55 4.72c0 2.43 2.6 1.68 3.12 1.46v3.36c-.55.3-1.54.54-2.89.54a4.15 4.15 0 0 1-4.27-4.24l.01-13.17 4.02-.86v3.54h3.14V9.1h-3.13v5.85zm-4.91.7c0 2.97-2.31 4.66-5.73 4.66a11.2 11.2 0 0 1-4.46-.93v-3.93c1.38.75 3.1 1.31 4.46 1.31.92 0 1.53-.24 1.53-1C6.26 13.77 0 14.51 0 9.95 0 7.04 2.28 5.3 5.62 5.3c1.36 0 2.72.2 4.09.75v3.88a9.23 9.23 0 0 0-4.1-1.06c-.86 0-1.44.25-1.44.93 0 1.85 6.29.97 6.29 5.88z"/>
        </svg>
      </div>

      {/* Info Note */}
      <div className="mt-4 p-3 bg-white border-2 border-[#42499c] rounded-lg text-center">
        <p className="text-xs text-black">
          <strong>💳 Stripe Integration:</strong> Credit purchasing available soon. Register now for 100 free credits!
        </p>
      </div>
    </div>
  )
}
