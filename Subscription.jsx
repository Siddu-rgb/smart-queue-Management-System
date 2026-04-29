import { motion } from "framer-motion";
import { Check, Zap, Crown, Building2, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const plans = [
  {
    id: "free",
    name: "Free Trial",
    price: 0,
    period: "14 days",
    icon: Ticket,
    color: "from-gray-400 to-gray-500",
    features: [
      "1 Business location",
      "Up to 50 tokens/day",
      "Basic queue management",
      "Walk-in token generation",
      "Email support",
    ],
    cta: "Start Free Trial",
  },
  {
    id: "starter",
    name: "Starter",
    price: 499,
    period: "month",
    icon: Zap,
    color: "from-sky-500 to-cyan-500",
    features: [
      "1 Business location",
      "Unlimited tokens/day",
      "SMS notifications",
      "Live queue display",
      "Basic analytics",
      "Priority support",
    ],
    cta: "Get Starter",
  },
  {
    id: "pro",
    name: "Pro",
    price: 999,
    period: "month",
    icon: Crown,
    color: "from-violet-600 to-indigo-600",
    popular: true,
    features: [
      "3 Business locations",
      "Unlimited tokens/day",
      "SMS + WhatsApp notifications",
      "Multi-counter support",
      "Advanced analytics + AI",
      "VIP / Emergency queue",
      "Custom branding",
      "Priority support",
    ],
    cta: "Go Pro",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 1999,
    period: "month",
    icon: Building2,
    color: "from-amber-500 to-orange-500",
    features: [
      "Unlimited locations",
      "Unlimited tokens/day",
      "Full notification suite",
      "API access",
      "White-label solution",
      "Dedicated account manager",
      "SLA guarantee",
      "Custom integrations",
    ],
    cta: "Contact Sales",
  },
];

export default function Subscription() {
  const handleUpgrade = (plan) => {
    if (plan.id === "enterprise") {
      toast.info("Contact our sales team at sales@smartqueue.in");
    } else {
      toast.success(`Upgrading to ${plan.name}…`);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center">
        <h1 className="text-3xl font-space font-bold text-foreground">Choose Your Plan</h1>
        <p className="text-muted-foreground mt-2 max-w-md mx-auto">
          Scale your queue management as your business grows. All plans include free setup and onboarding.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5 max-w-6xl mx-auto">
        {plans.map((plan, i) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className={`relative bg-card border rounded-2xl p-5 shadow-sm flex flex-col ${
              plan.popular ? "border-primary shadow-lg shadow-primary/15 ring-2 ring-primary/30" : "border-border"
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="px-3 py-1 text-xs font-bold text-white rounded-full gradient-primary shadow-md">
                  Most Popular
                </span>
              </div>
            )}

            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center shadow-sm mb-4`}>
              <plan.icon className="w-5 h-5 text-white" />
            </div>

            <h2 className="font-space font-bold text-foreground text-lg">{plan.name}</h2>

            <div className="mt-2 mb-5">
              {plan.price === 0 ? (
                <p className="text-3xl font-space font-black text-foreground">Free</p>
              ) : (
                <div className="flex items-end gap-1">
                  <span className="text-sm text-muted-foreground">₹</span>
                  <span className="text-3xl font-space font-black text-foreground">{plan.price}</span>
                  <span className="text-sm text-muted-foreground mb-1">/{plan.period}</span>
                </div>
              )}
            </div>

            <ul className="space-y-2.5 flex-1 mb-6">
              {plan.features.map(f => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  {f}
                </li>
              ))}
            </ul>

            <Button
              onClick={() => handleUpgrade(plan)}
              className={`w-full border-0 text-white ${plan.popular ? "gradient-primary shadow-md shadow-primary/25" : `bg-gradient-to-r ${plan.color}`}`}
            >
              {plan.cta}
            </Button>
          </motion.div>
        ))}
      </div>

      {/* FAQ */}
      <div className="max-w-2xl mx-auto space-y-4">
        <h2 className="text-center font-space font-semibold text-foreground text-lg">Frequently Asked Questions</h2>
        {[
          { q: "Can I switch plans anytime?", a: "Yes, upgrade or downgrade at any time. Changes apply from the next billing cycle." },
          { q: "Is there a setup fee?", a: "No setup fee. We also offer free onboarding assistance for all paid plans." },
          { q: "Do you support multiple branches?", a: "Starter supports 1 branch. Pro supports 3, and Enterprise has unlimited branches." },
          { q: "What payment methods are accepted?", a: "UPI, net banking, credit/debit cards, and all major Indian payment gateways." },
        ].map(faq => (
          <div key={faq.q} className="bg-card border border-border rounded-xl p-4">
            <p className="font-medium text-foreground text-sm">{faq.q}</p>
            <p className="text-muted-foreground text-sm mt-1.5">{faq.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}