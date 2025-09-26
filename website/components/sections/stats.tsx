export function StatsSection() {
  const stats = [
    { label: "Students", value: "16,000+" },
    { label: "Faculty", value: "1,200+" },
    { label: "Academic Programs", value: "200+" },
    { label: "Research Centers", value: "25" },
    { label: "Countries Represented", value: "150" },
    { label: "Alumni Worldwide", value: "200,000+" },
  ]

  return (
    <section className="bg-slate-50 py-16">
      <div className="container">
        <h2 className="mb-12 text-center text-3xl font-bold">By the Numbers</h2>
        <div className="grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-6">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl font-bold text-primary">{stat.value}</div>
              <div className="mt-2 text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}