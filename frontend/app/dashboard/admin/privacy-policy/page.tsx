"use client";

export default function PrivacyPolicyPage() {
    return (
        <div className="max-w-3xl mx-auto bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 p-8 shadow-sm">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Privacy Policy & Data Protection</h1>
            <p className="text-sm text-slate-500 mb-8 border-b border-slate-100 dark:border-zinc-800 pb-4">Last Updated: January 15, 2026</p>

            <div className="space-y-6 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                <section>
                    <h3 className="font-bold text-slate-900 dark:text-white mb-2">1. Usage of Data</h3>
                    <p>Subham EPC collects operational data solely for the purpose of Environmental, Health, and Safety (EHS) monitoring and compliance. All data submitted via this portal is processed securely and used to generate internal safety reports.</p>
                </section>

                <section>
                    <h3 className="font-bold text-slate-900 dark:text-white mb-2">2. Data Security</h3>
                    <p>We employ industry-standard encryption (AES-256) for data at rest and TLS 1.3 for data in transit. Access to sensitive reports is restricted based on role-based access control (RBAC).</p>
                </section>

                <section>
                    <h3 className="font-bold text-slate-900 dark:text-white mb-2">3. Employee Information</h3>
                    <p>Personal Identifiable Information (PII) of employees involved in incidents is minimized. Only essential details required for regulatory reporting are retained for a statutory period of 10 years.</p>
                </section>

                <section>
                    <h3 className="font-bold text-slate-900 dark:text-white mb-2">4. Contact Officer</h3>
                    <p>For any data privacy concerns, please contact the Chief Information Security Officer (CISO) at <strong>security@shubhamepc.com</strong>.</p>
                </section>
            </div>
        </div>
    );
}
