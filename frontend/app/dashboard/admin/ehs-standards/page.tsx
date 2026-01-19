"use client";

export default function EHSStandardsPage() {
    const standards = [
        { code: 'ISO 45001:2018', title: 'Occupational Health and Safety Management Systems', desc: 'Framework for managing OH&S risks and preventing work-related injury and ill health.' },
        { code: 'ISO 14001:2015', title: 'Environmental Management Systems', desc: 'Requirements for an environmental management system to enhance environmental performance.' },
        { code: 'IS 14489:1998', title: 'Code of Practice on Occupational Safety & Health Audit', desc: 'Guidelines for conducting safety audits in industrial establishments.' },
    ];

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div>
                <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">EHS Compliance Standards</h2>
                <p className="text-sm text-slate-500">Reference documentation for regulatory compliance</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {standards.map((std, i) => (
                    <div key={i} className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm hover:border-[#0059b2]/50 transition-all cursor-pointer group">
                        <div className="flex justify-between items-start">
                            <div>
                                <span className="inline-block px-2 py-1 bg-slate-100 dark:bg-zinc-800 text-xs font-bold text-slate-600 dark:text-slate-300 rounded mb-2 group-hover:bg-[#0059b2] group-hover:text-white transition-colors">{std.code}</span>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 group-hover:text-[#0059b2] transition-colors">{std.title}</h3>
                                <p className="text-sm text-slate-500">{std.desc}</p>
                            </div>
                            <span className="material-symbols-outlined text-slate-300 group-hover:text-[#0059b2]">chevron_right</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Document Download Section */}
            <div className="bg-[#0059b2]/5 border border-[#0059b2]/20 rounded-xl p-6">
                <h4 className="text-sm font-bold text-[#0059b2] mb-4 uppercase tracking-wide">Internal Policy Documents</h4>
                <div className="flex gap-4">
                    <button className="flex items-center gap-2 bg-white dark:bg-zinc-800 px-4 py-2 rounded-lg border border-[#0059b2]/20 text-xs font-bold text-[#0059b2] shadow-sm hover:bg-[#0059b2] hover:text-white transition-all">
                        <span className="material-symbols-outlined text-lg">description</span> EHS Manual v4.2.pdf
                    </button>
                    <button className="flex items-center gap-2 bg-white dark:bg-zinc-800 px-4 py-2 rounded-lg border border-[#0059b2]/20 text-xs font-bold text-[#0059b2] shadow-sm hover:bg-[#0059b2] hover:text-white transition-all">
                        <span className="material-symbols-outlined text-lg">description</span> Incident Reporting Guidelines.pdf
                    </button>
                </div>
            </div>
        </div>
    );
}
